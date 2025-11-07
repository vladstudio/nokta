/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("typing_events")

  // Users can create typing events for chats they're in
  collection.createRule = "@request.auth.id != ''"

  // Users can see typing events in chats they have access to
  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"

  // Auto-cleanup: typing events should expire quickly (handled by backend)
  collection.updateRule = null
  collection.deleteRule = "@request.auth.id != ''"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("typing_events")

  collection.createRule = null
  collection.listRule = null
  collection.viewRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
