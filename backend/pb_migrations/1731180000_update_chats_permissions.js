/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Allow participants to update chats (needed for call management)
  // Users who are participants can update call-related fields
  chats.updateRule = 'participants.id ?= @request.auth.id'

  app.save(chats)

  return null
}, (app) => {
  // Rollback: revert to no update permission
  const chats = app.findCollectionByNameOrId("chats")
  chats.updateRule = null
  app.save(chats)

  return null
})
