/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // FIX #7: Make sender required for messages
  const collection = app.findCollectionByNameOrId("messages")

  // Update sender field to be required
  collection.fields.filterRecordsByField("sender", "name", 1).forEach((field) => {
    field.required = true
  })

  return app.save(collection)
}, (app) => {
  // Rollback: make sender optional again
  const collection = app.findCollectionByNameOrId("messages")

  collection.fields.filterRecordsByField("sender", "name", 1).forEach((field) => {
    field.required = false
  })

  return app.save(collection)
})
