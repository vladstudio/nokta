/// <reference path="../pb_data/types.d.ts" />

/**
 * Cleanup hook for old call invites
 *
 * Automatically deletes invites older than 15 minutes.
 * This prevents stale invites from accumulating in the database.
 *
 * Runs every 5 minutes via cron.
 */

cronAdd("cleanup_expired_invites", "*/5 * * * *", () => {
  const INVITE_LIFETIME = 15 * 60 * 1000; // 15 minutes

  try {
    const cutoffTime = new Date(Date.now() - INVITE_LIFETIME);
    const oldInvites = $app.findRecordsByFilter(
      "call_invites",
      `created < "${cutoffTime.toISOString()}"`
    );

    if (oldInvites.length > 0) {
      console.log(`[Cleanup] Found ${oldInvites.length} old invites to delete`);

      arrayOf(oldInvites).forEach((invite) => {
        try {
          $app.delete("call_invites", invite.id);
          console.log(`[Cleanup] Deleted old invite: ${invite.id}`);
        } catch (err) {
          console.error(`[Cleanup] Failed to delete invite ${invite.id}:`, err);
        }
      });

      console.log(`[Cleanup] Cleanup completed: ${oldInvites.length} invites processed`);
    }
  } catch (err) {
    console.error('[Cleanup] Old invites cleanup failed:', err);
  }
});
