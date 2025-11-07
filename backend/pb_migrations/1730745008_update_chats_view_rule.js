/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Update view rule to allow users to see chat fields
  // For now, just allow all authenticated users to view all chats (for admin UI)
  chats.viewRule = "@request.auth.id != ''"
  chats.listRule = "@request.auth.id != ''"

  app.save(chats)

  return null
}, (app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Rollback to previous state (from 1730745005_configure_access_rules.js)
  chats.viewRule = "@request.auth.id != ''"
  chats.listRule = "@request.auth.id != ''"
  chats.createRule = null

  app.save(chats)

  return null
})
