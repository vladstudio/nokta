/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Users: Allow viewing other users (needed for chat), restrict updates/deletes to own account
  const users = app.findCollectionByNameOrId("users")
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'
  app.save(users)

  // Spaces: Allow authenticated users, admin operations via backend only
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = '@request.auth.id != ""'
  spaces.updateRule = null
  spaces.deleteRule = null
  app.save(spaces)

  // Space Members: Allow viewing, admin operations via backend only
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = '@request.auth.id != ""'
  spaceMembers.viewRule = '@request.auth.id != ""'
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  // Chats: Public chats visible to all, private chats only to participants
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = '@request.auth.id != "" && (type = "public" || participants.id ?= @request.auth.id)'
  chats.viewRule = '@request.auth.id != "" && (type = "public" || participants.id ?= @request.auth.id)'
  chats.createRule = '@request.auth.id != ""'
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  // Messages: Access based on chat type and participants
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.viewRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.createRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.updateRule = null
  messages.deleteRule = null
  app.save(messages)

  // Typing Events: Allow authenticated users (ephemeral data)
  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = '@request.auth.id != ""'
  typingEvents.viewRule = '@request.auth.id != ""'
  typingEvents.createRule = '@request.auth.id != ""'
  typingEvents.updateRule = null
  typingEvents.deleteRule = '@request.auth.id != ""'
  app.save(typingEvents)

  return null
}, (app) => {
  // Rollback: remove all rules
  const users = app.findCollectionByNameOrId("users")
  users.listRule = null
  users.viewRule = null
  users.updateRule = null
  users.deleteRule = null
  app.save(users)

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

  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = null
  chats.viewRule = null
  chats.createRule = null
  chats.updateRule = null
  chats.deleteRule = null
  app.save(chats)

  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = null
  messages.viewRule = null
  messages.createRule = null
  messages.updateRule = null
  messages.deleteRule = null
  app.save(messages)

  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = null
  typingEvents.viewRule = null
  typingEvents.createRule = null
  typingEvents.updateRule = null
  typingEvents.deleteRule = null
  app.save(typingEvents)

  return null
})
