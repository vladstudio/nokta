/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // FIX #8: Fix cascade delete behavior for space_members
  // When a user is deleted, we should NOT cascade delete their space memberships
  // Instead, we should preserve the space data and only remove the membership record gracefully
  const collection = app.findCollectionByNameOrId("space_members")

  // Update user relation to not cascade delete
  collection.fields.filterRecordsByField("user", "name", 1).forEach((field) => {
    field.cascadeDelete = false
  })

  return app.save(collection)
}, (app) => {
  // Rollback: restore cascade delete
  const collection = app.findCollectionByNameOrId("space_members")

  collection.fields.filterRecordsByField("user", "name", 1).forEach((field) => {
    field.cascadeDelete = true
  })

  return app.save(collection)
})
