import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      `[Brevo Webhook] Received import completion for process ${processId}`,
    );
    console.log("[Brevo Webhook] Full payload:", body);

    const supabase = await createClient();

    // Debug: Check all recent sync jobs
    const { data: allRecentJobs } = await supabase
      .from("brevo_syncs")
      .select("id, brevo_process_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    console.log("[Brevo Webhook] Recent sync jobs:", allRecentJobs);

    // Find the brevo_syncs record that matches this process ID
    // Note: Brevo sends process_id as a string, ensure comparison works
    console.log(
      `[Brevo Webhook] Looking for brevo_process_id: "${processId}" (type: ${typeof processId})`,
    );

    const { data: syncJob, error: queryError } = await supabase
      .from("brevo_syncs")
      .select("*")
      .eq("brevo_process_id", processId)
      .maybeSingle();

    if (queryError) {
      console.error("[Brevo Webhook] Failed to query sync jobs:", queryError);
      return NextResponse.json(
        { error: "Failed to query sync jobs" },
        { status: 500 },
      );
    }

    console.log(
      `[Brevo Webhook] Found sync job:`,
      syncJob
        ? `ID: ${syncJob.id}, process_id: ${syncJob.brevo_process_id}`
        : "null",
    );

    if (syncJob) {
      const metadata = (syncJob.metadata as Record<string, unknown>) || {};
      const submissionIds = metadata.submission_ids as string[] | undefined;

      // Store the entire webhook payload in brevo_metadata with timestamp
      const webhookData = {
        ...body,
        webhook_received_at: new Date().toISOString(),
      };

      // Update the sync job with the complete webhook payload and mark as completed
      const { error: updateError } = await supabase
        .from("brevo_syncs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          brevo_metadata: webhookData,
        })
        .eq("id", syncJob.id);

      if (updateError) {
        console.error(
          "[Brevo Webhook] Failed to update sync job:",
          updateError,
        );
      } else {
        console.log(
          `[Brevo Webhook] Updated sync job ${syncJob.id} with import results`,
        );
      }

      // Update form submissions to "success"
      // Since Brevo doesn't tell us which specific contacts failed,
      // we mark all "processing" submissions from this sync as "success"
      if (submissionIds && submissionIds.length > 0) {
        const { error: submissionUpdateError } = await supabase
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
