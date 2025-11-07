/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix users collection - allow authenticated users to view/list others (needed for chat)
  const users = app.findCollectionByNameOrId("users")
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  // Keep update/delete restricted to own account
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'
  app.save(users)

  // Fix spaces - authenticated users can see all spaces for now (TODO: restrict by membership)
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = '@request.auth.id != ""'
  spaces.updateRule = null // Disable updates for safety
  spaces.deleteRule = null
  app.save(spaces)

  // Fix space_members - authenticated users can see members
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = '@request.auth.id != ""'
  spaceMembers.viewRule = '@request.auth.id != ""'
  spaceMembers.createRule = null // Only backend creates members
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  // Fix chats - authenticated users can access chats (TODO: restrict to participants)
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = '@request.auth.id != ""'
  chats.viewRule = '@request.auth.id != ""'
  chats.createRule = '@request.auth.id != ""'
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  // Fix messages - authenticated users can see messages (TODO: restrict to chat participants)
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = '@request.auth.id != ""'
  messages.viewRule = '@request.auth.id != ""'
  messages.createRule = '@request.auth.id != ""'
  messages.updateRule = null
  messages.deleteRule = null // Disable delete for now
  app.save(messages)

  return null
}, (app) => {
  // Rollback to permissive rules (old insecure state)
  const users = app.findCollectionByNameOrId("users")
  users.listRule = 'id = @request.auth.id'
  users.viewRule = 'id = @request.auth.id'
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'
  app.save(users)

  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = null
  spaces.updateRule = null
  spaces.deleteRule = null
  app.save(spaces)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = '@request.auth.id != ""'
  spaceMembers.viewRule = '@request.auth.id != ""'
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = '@request.auth.id != ""'
  chats.viewRule = '@request.auth.id != ""'
  chats.createRule = '@request.auth.id != ""'
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = '@request.auth.id != ""'
  messages.viewRule = '@request.auth.id != ""'
  messages.createRule = '@request.auth.id != ""'
  messages.updateRule = null
  messages.deleteRule = null
  app.save(messages)

  return null
})
