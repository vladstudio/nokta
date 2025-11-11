/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("chats")

  // Allow any participant to delete the chat
  collection.deleteRule = '@request.auth.id != "" && participants.id ?= @request.auth.id'

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("chats")

  // Revert to original rule (only creator can delete)
  collection.deleteRule = 'created_by = @request.auth.id'

  return app.save(collection)
})
