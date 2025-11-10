/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Allow chat creator to delete their created chats
  chats.deleteRule = 'created_by = @request.auth.id'

  app.save(chats)

  return null
}, (app) => {
  // Rollback: revert to no delete permission
  const chats = app.findCollectionByNameOrId("chats")
  chats.deleteRule = null
  app.save(chats)

  return null
})
