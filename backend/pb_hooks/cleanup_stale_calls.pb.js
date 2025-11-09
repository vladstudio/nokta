/// <reference path="../pb_data/types.d.ts" />

/**
 * Cleanup hook for stale calls
 *
 * Automatically deletes calls that have been inactive for more than 10 minutes.
 * This handles edge cases where users:
 * - Close browser without clicking Leave
 * - Experience network disconnect
 * - Have app crash
 *
 * Runs every 5 minutes via cron.
 */

cronAdd("cleanup_stale_calls", "*/5 * * * *", () => {
  const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

  try {
    const staleTime = new Date(Date.now() - STALE_THRESHOLD);
    const staleCalls = $app.findRecordsByFilter(
      "calls",
      `last_activity < "${staleTime.toISOString()}"`
    );

    if (staleCalls.length > 0) {
      console.log(`[Cleanup] Found ${staleCalls.length} stale calls to delete`);

      arrayOf(staleCalls).forEach((call) => {
        try {
          // Delete call record (invites cascade delete automatically)
          $app.delete("calls", call.id);
          console.log(`[Cleanup] Deleted stale call: ${call.id}`);

          // Note: Daily.co room deletion is handled by frontend API
          // Backend could add Daily.co API integration here if needed
        } catch (err) {
          console.error(`[Cleanup] Failed to delete call ${call.id}:`, err);
        }
      });

      console.log(`[Cleanup] Cleanup completed: ${staleCalls.length} calls processed`);
    }
  } catch (err) {
    console.error('[Cleanup] Stale calls cleanup failed:', err);
  }
});
