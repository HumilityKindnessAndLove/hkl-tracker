import { NextResponse } from "next/server";
import type { Database } from "@/database.types";
import {
  BREVO_LANGUAGE_MAP,
  type BrevoImportContact,
  importBrevoContacts,
} from "@/lib/brevo";
import { createClient } from "@/lib/supabase/server";

type FormSubmission = Database["public"]["Tables"]["form_submissions"]["Row"];

const BATCH_SIZE = 100;

const MAX_RETRY_COUNT = 5;

// Helper function to calculate exponential backoff
function shouldRetry(submission: FormSubmission): boolean {
  if (submission.brevo_status !== "error") return false;
  if (submission.brevo_retry_count >= MAX_RETRY_COUNT) return false;

  if (!submission.brevo_last_attempt_at) return true;

  // Calculate backoff time: 2^retry_count hours
  const backoffHours = 2 ** submission.brevo_retry_count;
  const backoffMs = backoffHours * 60 * 60 * 1000;
  const lastAttemptTime = new Date(submission.brevo_last_attempt_at).getTime();
  const now = Date.now();

  return now - lastAttemptTime >= backoffMs;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  let cronJobId: string | null = null;

  const authHeader = request.headers.get("authorization");

  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("[Brevo Sync] Unauthorized cron request attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.warn(
        "[Brevo Sync] Development mode: Invalid or missing CRON_SECRET",
      );
    }
  }

  try {
    const supabase = await createClient();

    // Create a new brevo_syncs record
    const { data: cronJob, error: cronJobError } = await supabase
      .from("brevo_syncs")
      .insert({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (cronJobError || !cronJob) {
      console.error("Failed to create brevo_syncs record:", cronJobError);
      return NextResponse.json(
        { error: "Failed to initialize cron job" },
        { status: 500 },
      );
    }

    cronJobId = cronJob.id;
    console.log(`[Brevo Sync ${cronJobId}] Started`);

    // Query pending submissions
    const { data: submissions, error: queryError } = await supabase
      .from("form_submissions")
      .select("*")
      .not("email", "is", null)
      .or(
        `brevo_status.is.null,brevo_status.eq.pending,and(brevo_status.eq.error,brevo_retry_count.lt.${MAX_RETRY_COUNT})`,
      )
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (queryError) {
      throw new Error(`Failed to query submissions: ${queryError.message}`);
    }

    if (!submissions || submissions.length === 0) {
      console.log(`[Brevo Sync ${cronJobId}] No pending submissions found`);
      await supabase
        .from("brevo_syncs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          contacts_sent: 0,
          metadata: {
            execution_time_ms: Date.now() - startTime,
            message: "No pending submissions",
          },
        })
        .eq("id", cronJobId);

      return NextResponse.json({
        message: "No pending submissions to process",
        cronJobId,
      });
    }

    // Filter submissions that should be retried (for error status)
    const submissionsToProcess = submissions.filter((sub) => {
      if (
        sub.brevo_status === "pending" ||
        sub.brevo_status === null ||
        sub.brevo_status === undefined
      ) {
        return true;
      }
      return shouldRetry(sub);
    });

    console.log(
      `[Brevo Sync ${cronJobId}] Processing ${submissionsToProcess.length} submissions`,
    );

    // Prepare contacts for bulk import
    const contactsToImport: BrevoImportContact[] = [];
    const submissionIdMap = new Map<string, string>();

    for (const submission of submissionsToProcess) {
      // Update attempt tracking
      await supabase
        .from("form_submissions")
        .update({
          brevo_retry_count: submission.brevo_retry_count + 1,
          brevo_last_attempt_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      const contact: BrevoImportContact = {
        EMAIL: submission.email,
      };

      if (submission.name) contact.FIRSTNAME = submission.name;
      if (submission.city) contact.CITY = submission.city;
      if (submission.country) contact.COUNTRY = submission.country;
      if (submission.sms) contact.SMS = submission.sms;
      if (submission.volunteer_id)
        contact.VOLUNTEER_ID = submission.volunteer_id;
      if (submission.language) {
        contact.YOUR_PREFERRED_LANGUAGE =
          BREVO_LANGUAGE_MAP[submission.language] ?? null;
      }

      contactsToImport.push(contact);
      submissionIdMap.set(submission.email, submission.id);
    }

    console.log(
      `[Brevo Sync ${cronJobId}] Prepared ${contactsToImport.length} contacts for import`,
    );

    // Step 4: Import contacts in bulk
    if (contactsToImport.length > 0) {
      try {
        const brevoResult = await importBrevoContacts(contactsToImport);

        if (brevoResult.success) {
          // Update all submissions as "processing" - queued for import
          // The webhook will update them to "success" once Brevo confirms completion
          const submissionIds = Array.from(submissionIdMap.values());

          const { error: updateError } = await supabase
            .from("form_submissions")
            .update({
              brevo_status: "processing",
              brevo_last_attempt_at: new Date().toISOString(),
              brevo_error: null,
              brevo_processed_by_sync_id: cronJobId,
            })
            .in("id", submissionIds);

          if (updateError) {
            console.error(
              `[Brevo Sync ${cronJobId}] Failed to update submissions:`,
              updateError,
            );

            // Mark sync as failed
            await supabase
              .from("brevo_syncs")
              .update({
                status: "failed",
                completed_at: new Date().toISOString(),
                error_message: `Failed to update submissions: ${updateError.message}`,
                contacts_sent: contactsToImport.length,
                metadata: {
                  batch_size: BATCH_SIZE,
                  execution_time_ms: Date.now() - startTime,
                  submissions_queried: submissions.length,
                  submissions_filtered: submissionsToProcess.length,
                  submission_ids: submissionIds,
                },
              })
              .eq("id", cronJobId);
          } else {
            console.log(
              `[Brevo Sync ${cronJobId}] Successfully queued ${contactsToImport.length} contacts for import. Process ID: ${brevoResult.process_id}`,
            );

            // Store the Brevo process ID and submission IDs
            await supabase
              .from("brevo_syncs")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
                contacts_sent: contactsToImport.length,
                brevo_process_id: brevoResult.process_id,
                metadata: {
                  batch_size: BATCH_SIZE,
                  execution_time_ms: Date.now() - startTime,
                  submissions_queried: submissions.length,
                  submissions_filtered: submissionsToProcess.length,
                  submission_ids: submissionIds,
                },
              })
              .eq("id", cronJobId);
          }
        } else {
          // Bulk import failed - mark all submissions as error
          const submissionIds = Array.from(submissionIdMap.values());

          await supabase
            .from("form_submissions")
            .update({
              brevo_status: "error",
              brevo_error: brevoResult.error || "Bulk import failed",
              brevo_last_attempt_at: new Date().toISOString(),
            })
            .in("id", submissionIds);

          console.error(
            `[Brevo Sync ${cronJobId}] Bulk import failed: ${brevoResult.error}`,
          );

          // Mark sync as failed
          await supabase
            .from("brevo_syncs")
            .update({
              status: "failed",
              completed_at: new Date().toISOString(),
              error_message: brevoResult.error || "Bulk import failed",
              contacts_sent: contactsToImport.length,
              metadata: {
                batch_size: BATCH_SIZE,
                execution_time_ms: Date.now() - startTime,
                submissions_queried: submissions.length,
                submissions_filtered: submissionsToProcess.length,
                submission_ids: submissionIds,
              },
            })
            .eq("id", cronJobId);
        }
      } catch (error) {
        // Handle bulk import exception
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const submissionIds = Array.from(submissionIdMap.values());

        await supabase
          .from("form_submissions")
          .update({
            brevo_status: "error",
            brevo_error: `Bulk import exception: ${errorMessage}`,
            brevo_last_attempt_at: new Date().toISOString(),
          })
          .in("id", submissionIds);

        console.error(
          `[Brevo Sync ${cronJobId}] Exception during bulk import:`,
          error,
        );

        // Mark sync as failed
        await supabase
          .from("brevo_syncs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            contacts_sent: contactsToImport.length,
            metadata: {
              batch_size: BATCH_SIZE,
              execution_time_ms: Date.now() - startTime,
              submissions_queried: submissions.length,
              submissions_filtered: submissionsToProcess.length,
              submission_ids: submissionIds,
            },
          })
          .eq("id", cronJobId);
      }
    }

    console.log(
      `[Brevo Sync ${cronJobId}] Completed - Sent ${contactsToImport.length} contacts to Brevo`,
    );

    return NextResponse.json({
      cronJobId,
      status: "completed",
      contacts_sent: contactsToImport.length,
      execution_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    // Handle fatal errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Brevo Sync ${cronJobId}] Fatal error:`, error);

    // Update cron job status to failed
    if (cronJobId) {
      try {
        const supabase = await createClient();
        await supabase
          .from("brevo_syncs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            metadata: {
              execution_time_ms: Date.now() - startTime,
            },
          })
          .eq("id", cronJobId);
      } catch (updateError) {
        console.error(
          `[Brevo Sync ${cronJobId}] Failed to update error status:`,
          updateError,
        );
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        cronJobId,
      },
      { status: 500 },
    );
  }
}
