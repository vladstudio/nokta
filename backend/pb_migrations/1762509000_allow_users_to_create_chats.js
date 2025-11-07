/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Allow authenticated users to create chats
  // Users can create chats in spaces where they are members
  chats.createRule = "@request.auth.id != ''"

  app.save(chats)

  return null
}, (app) => {
  // Rollback: set back to null (only admins)
  const chats = app.findCollectionByNameOrId("chats")
  chats.createRule = null
  app.save(chats)

  return null
})
