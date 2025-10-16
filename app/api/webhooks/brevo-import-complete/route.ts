import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Webhook endpoint to receive Brevo import completion notifications
 * This is called by Brevo when a bulk import finishes processing
 *
 * Brevo sends URL-encoded form data with these fields (that have been observed):
 * - proc_success: Process ID (unique identifier for this import)
 * - imported_contacts: Total contacts imported
 * - new_emails: Number of new contacts created
 * - emails_exists: Number of existing contacts
 * - updated_contacts: Number of contacts updated
 * - unchanged_contacts: Number of unchanged contacts
 * - listids: Comma-separated list IDs
 * - list_stats[ID][NewContacts]: New contacts per list
 * - list_stats[ID][ExistingContact]: Existing contacts per list
 * - list_stats[ID][MergedContact]: Merged contacts per list
 *
 * Note: Brevo doesn't send individual contact success/failure info,
 * so we mark all "processing" submissions as "success" when webhook confirms.
 */

interface BrevoImportWebhookPayload {
  proc_success?: string; // Process ID
  imported_contacts?: string;
  new_emails?: string;
  emails_exists?: string;
  updated_contacts?: string;
  unchanged_contacts?: string;
  listids?: string;
  [key: string]: string | undefined; // For list_stats dynamic keys
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    let body: BrevoImportWebhookPayload;

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      // Fallback to JSON if content-type is different
      body = (await request.json()) as BrevoImportWebhookPayload;
    }

    const processId = body.proc_success;

    if (!processId) {
      console.error("[Brevo Webhook] No proc_success in webhook payload");
      return NextResponse.json(
        { error: "Missing proc_success" },
        { status: 400 },
      );
    }

    console.log(
      `[Brevo Webhook] Received import completion for process ${processId}:`,
      {
        imported_contacts: body.imported_contacts,
        new_emails: body.new_emails,
        emails_exists: body.emails_exists,
        updated_contacts: body.updated_contacts,
        unchanged_contacts: body.unchanged_contacts,
      },
    );

    const supabase = await createClient();

    // Find the brevo_syncs record that matches this process ID
    const { data: syncJobs, error: queryError } = await supabase
      .from("brevo_syncs")
      .select("*")
      .or("status.eq.completed,status.eq.partial")
      .order("completed_at", { ascending: false })
      .limit(10); // Check last 10 jobs

    if (queryError) {
      console.error("[Brevo Webhook] Failed to query sync jobs:", queryError);
      return NextResponse.json(
        { error: "Failed to query sync jobs" },
        { status: 500 },
      );
    }

    // Find the sync job that matches this process ID in metadata
    const matchingSyncJob = syncJobs?.find(
      (job) =>
        job.metadata &&
        typeof job.metadata === "object" &&
        "brevo_process_id" in job.metadata &&
        job.metadata.brevo_process_id === processId,
    );

    if (matchingSyncJob) {
      const metadata = matchingSyncJob.metadata as Record<string, unknown>;
      const submissionIds = metadata.submission_ids as string[] | undefined;

      // Update the sync job with Brevo import results
      const { error: updateError } = await supabase
        .from("brevo_syncs")
        .update({
          webhook_received_at: new Date().toISOString(),
          imported_contacts: body.imported_contacts
            ? Number.parseInt(body.imported_contacts, 10)
            : null,
          new_emails: body.new_emails
            ? Number.parseInt(body.new_emails, 10)
            : null,
          emails_exists: body.emails_exists
            ? Number.parseInt(body.emails_exists, 10)
            : null,
          updated_contacts: body.updated_contacts
            ? Number.parseInt(body.updated_contacts, 10)
            : null,
          unchanged_contacts: body.unchanged_contacts
            ? Number.parseInt(body.unchanged_contacts, 10)
            : null,
        })
        .eq("id", matchingSyncJob.id);

      if (updateError) {
        console.error(
          "[Brevo Webhook] Failed to update sync job:",
          updateError,
        );
      } else {
        console.log(
          `[Brevo Webhook] Updated sync job ${matchingSyncJob.id} with import results`,
        );
      }

      // Update form submissions to "success"
      // Since Brevo doesn't tell us which specific contacts failed,
      // we mark all "processing" submissions from this sync as "success"
      if (submissionIds && submissionIds.length > 0) {
        const { error: submissionUpdateError, count } = await supabase
          .from("form_submissions")
          .update({
            brevo_status: "success",
            brevo_sent_at: new Date().toISOString(),
            brevo_error: null,
          })
          .in("id", submissionIds)
          .eq("brevo_status", "processing"); // Only update if still processing

        if (submissionUpdateError) {
          console.error(
            "[Brevo Webhook] Failed to update form submissions:",
            submissionUpdateError,
          );
        } else {
          console.log(
            `[Brevo Webhook] Marked ${count || 0} submissions as success`,
          );
        }
      }
    } else {
      console.warn(
        `[Brevo Webhook] No matching sync job found for process ${processId}`,
      );
    }

    // Check for any "processing" submissions older than 1 hour and mark them as failed
    // so they can be retried by the cron job (likely stuck due to webhook issues)
    const { error: stuckUpdateError, count: stuckCount } = await supabase
      .from("form_submissions")
      .update({
        brevo_status: "error",
        brevo_error: "Import timed out - no webhook confirmation received",
      })
      .eq("brevo_status", "processing")
      .lt(
        "brevo_last_attempt_at",
        new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour
      );

    if (!stuckUpdateError && (stuckCount || 0) > 0) {
      console.log(
        `[Brevo Webhook] Marked ${stuckCount} stuck processing submissions as error for retry`,
      );
    } else if (stuckUpdateError) {
      console.error(
        "[Brevo Webhook] Failed to update stuck submissions:",
        stuckUpdateError,
      );
    }

    return NextResponse.json({
      success: true,
      received: processId,
      imported_contacts: body.imported_contacts,
    });
  } catch (error) {
    console.error("[Brevo Webhook] Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
