/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Messages: Allow sender to update their own messages
  const messages = app.findCollectionByNameOrId("messages")
  messages.updateRule = 'sender = @request.auth.id'
  app.save(messages)

  return null
}, (app) => {
  // Rollback: disable message updates
  const messages = app.findCollectionByNameOrId("messages")
  messages.updateRule = null
  app.save(messages)

  return null
})
