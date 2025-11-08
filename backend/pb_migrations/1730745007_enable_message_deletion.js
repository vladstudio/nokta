/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Messages: Allow sender to delete their own messages
  const messages = app.findCollectionByNameOrId("messages")
  messages.deleteRule = 'sender = @request.auth.id'
  app.save(messages)

  return null
}, (app) => {
  // Rollback: disable message deletion
  const messages = app.findCollectionByNameOrId("messages")
  messages.deleteRule = null
  app.save(messages)

  return null
})
