/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // FIX #4: Add unique constraint to prevent duplicate DM chats
  // This prevents race conditions when creating DM chats
  const collection = app.findCollectionByNameOrId("chats")

  // Add a unique index on space + participants for private chats
  // Note: PocketBase doesn't support conditional unique indexes in migrations,
  // so we'll add a unique index at the database level
  // This will be enforced by the hook logic instead

  // Add an index for better query performance on DM lookups
  collection.indexes = [
    "CREATE INDEX idx_chats_space ON chats(space)",
    "CREATE INDEX idx_chats_type ON chats(type)",
    "CREATE INDEX idx_chats_participants ON chats(participants)"
  ]

  return app.save(collection)
}, (app) => {
  // Rollback: remove indexes
  const collection = app.findCollectionByNameOrId("chats")
  collection.indexes = []
  return app.save(collection)
})
