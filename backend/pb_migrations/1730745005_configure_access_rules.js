/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Configure messages collection - basic auth required for now
  // Will refine rules via admin UI after collections are set up
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = "@request.auth.id != ''"
  messages.viewRule = "@request.auth.id != ''"
  messages.createRule = "@request.auth.id != ''"
  messages.updateRule = null
  messages.deleteRule = null
  app.save(messages)

  // Configure chats collection
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = "@request.auth.id != ''"
  chats.viewRule = "@request.auth.id != ''"
  chats.createRule = null // Only backend can create chats
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  // Configure spaces collection
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = "@request.auth.id != ''"
  spaces.viewRule = "@request.auth.id != ''"
  spaces.createRule = null // Only admins via backend
  spaces.updateRule = null
  spaces.deleteRule = null
  app.save(spaces)

  // Configure space_members collection
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = "@request.auth.id != ''"
  spaceMembers.viewRule = "@request.auth.id != ''"
  spaceMembers.createRule = null // Only admins via backend
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  return null
}, (app) => {
  // Rollback: remove all rules
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = null
  messages.viewRule = null
  messages.createRule = null
  messages.updateRule = null
  messages.deleteRule = null
  app.save(messages)

  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = null
  chats.viewRule = null
  chats.createRule = null
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = null
  spaces.viewRule = null
  spaces.createRule = null
  spaces.updateRule = null
  spaces.deleteRule = null
  app.save(spaces)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = null
  spaceMembers.viewRule = null
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  return null
})
