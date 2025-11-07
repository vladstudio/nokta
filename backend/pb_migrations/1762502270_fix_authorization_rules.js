/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // FIX #1: Properly restrict space_members access
  const spaceMembers = app.findCollectionByNameOrId("space_members")

  // Anyone can view members in spaces they belong to
  spaceMembers.listRule = "space.space_members.user ?= @request.auth.id"
  spaceMembers.viewRule = "space.space_members.user ?= @request.auth.id"

  // Only space admins can add members
  spaceMembers.createRule = "@request.auth.id != '' && @request.data.space.space_members.user ?= @request.auth.id && @request.data.space.space_members.role ?= 'admin'"

  // Only space admins can update member roles (and can't modify their own role)
  spaceMembers.updateRule = "space.space_members.user ?= @request.auth.id && space.space_members.role ?= 'admin' && user != @request.auth.id"

  // Space admins can remove members (but not themselves)
  spaceMembers.deleteRule = "space.space_members.user ?= @request.auth.id && space.space_members.role ?= 'admin' && user != @request.auth.id"

  app.save(spaceMembers)

  // Only allow space members to update spaces they're admins of
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = "space_members.user ?= @request.auth.id"
  spaces.viewRule = "space_members.user ?= @request.auth.id"
  spaces.createRule = "@request.auth.id != ''"
  spaces.updateRule = "space_members.user ?= @request.auth.id && space_members.role ?= 'admin'"
  spaces.deleteRule = "space_members.user ?= @request.auth.id && space_members.role ?= 'admin'"
  app.save(spaces)

  // FIX #2: Properly restrict chat access
  const chats = app.findCollectionByNameOrId("chats")

  // Users can only see chats in their spaces, and only private chats they're part of
  chats.listRule = "space.space_members.user ?= @request.auth.id && (type = 'public' || (type = 'private' && participants.id ?= @request.auth.id))"
  chats.viewRule = "space.space_members.user ?= @request.auth.id && (type = 'public' || (type = 'private' && participants.id ?= @request.auth.id))"

  // Still backend-only for creation
  chats.createRule = null
  chats.updateRule = null
  chats.deleteRule = null

  app.save(chats)

  // Restrict messages to chat participants
  const messages = app.findCollectionByNameOrId("messages")

  // Users can only see messages in chats they have access to
  messages.listRule = "chat.space.space_members.user ?= @request.auth.id && (chat.type = 'public' || (chat.type = 'private' && chat.participants.id ?= @request.auth.id))"
  messages.viewRule = "chat.space.space_members.user ?= @request.auth.id && (chat.type = 'public' || (chat.type = 'private' && chat.participants.id ?= @request.auth.id))"

  // Users can only create messages as themselves in chats they have access to
  messages.createRule = "@request.auth.id != '' && @request.data.sender = @request.auth.id && @request.data.chat.space.space_members.user ?= @request.auth.id && (@request.data.chat.type = 'public' || (@request.data.chat.type = 'private' && @request.data.chat.participants.id ?= @request.auth.id))"

  // No updates or deletes
  messages.updateRule = null
  messages.deleteRule = null

  app.save(messages)

  return null
}, (app) => {
  // Rollback to previous permissive rules
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.listRule = "@request.auth.id != ''"
  spaceMembers.viewRule = "@request.auth.id != ''"
  spaceMembers.createRule = "@request.auth.id != ''"
  spaceMembers.updateRule = "@request.auth.id != ''"
  spaceMembers.deleteRule = "@request.auth.id != ''"
  app.save(spaceMembers)

  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.listRule = "@request.auth.id != ''"
  spaces.viewRule = "@request.auth.id != ''"
  spaces.createRule = "@request.auth.id != ''"
  spaces.updateRule = "@request.auth.id != ''"
  app.save(spaces)

  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = "@request.auth.id != ''"
  chats.viewRule = "@request.auth.id != ''"
  chats.createRule = null
  app.save(chats)

  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = "@request.auth.id != ''"
  messages.viewRule = "@request.auth.id != ''"
  messages.createRule = "@request.auth.id != ''"
  app.save(messages)

  return null
})
