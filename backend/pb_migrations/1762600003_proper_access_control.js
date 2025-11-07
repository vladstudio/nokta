/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Implement proper access control based on space membership and chat participants

  // Users: Allow viewing other users (needed for chat), but restrict updates/deletes to own account
  const users = app.findCollectionByNameOrId("users")
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'
  app.save(users)

  // Spaces: Allow authenticated users (membership filtering handled by backend/app logic)
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = '@request.auth.id != ""'
  spaces.updateRule = null // Updates via backend only
  spaces.deleteRule = null // Deletes via backend only
  app.save(spaces)

  // Space Members: Allow viewing, admin operations via backend only
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = '@request.auth.id != ""'
  spaceMembers.viewRule = '@request.auth.id != ""'
  spaceMembers.createRule = null // Via backend/hooks only
  spaceMembers.updateRule = null // Via backend/hooks only
  spaceMembers.deleteRule = null // Via backend/hooks only
  app.save(spaceMembers)

  // Chats: Public chats visible to all, private chats only to participants
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = '@request.auth.id != "" && (type = "public" || participants.id ?= @request.auth.id)'
  chats.viewRule = '@request.auth.id != "" && (type = "public" || participants.id ?= @request.auth.id)'
  chats.createRule = '@request.auth.id != ""' // Creation allowed, backend validates participants
  chats.updateRule = null // Disable updates
  chats.deleteRule = null // Disable deletes
  app.save(chats)

  // Messages: Allow access to messages in public chats or chats where user is participant
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.viewRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.createRule = '@request.auth.id != "" && (chat.type = "public" || chat.participants.id ?= @request.auth.id)'
  messages.updateRule = null // Disable updates
  messages.deleteRule = null // Disable deletes
  app.save(messages)

  // Typing Events: Allow authenticated users (ephemeral data, low security risk)
  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = '@request.auth.id != ""'
  typingEvents.viewRule = '@request.auth.id != ""'
  typingEvents.createRule = '@request.auth.id != ""'
  typingEvents.updateRule = null
  typingEvents.deleteRule = '@request.auth.id != ""'
  app.save(typingEvents)

  return null
}, (app) => {
  // Rollback to previous permissive state (from 1731011000_fix_security_permissions.js)
  const users = app.findCollectionByNameOrId("users")
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'
  app.save(users)

  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = '@request.auth.id != ""'
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

  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = '@request.auth.id != ""'
  typingEvents.viewRule = '@request.auth.id != ""'
  typingEvents.createRule = '@request.auth.id != ""'
  typingEvents.updateRule = null
  typingEvents.deleteRule = '@request.auth.id != ""'
  app.save(typingEvents)

  return null
})
