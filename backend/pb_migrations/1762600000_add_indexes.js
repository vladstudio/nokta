/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add indexes to improve query performance on frequently queried relations

  // Index on messages.chat for fast message retrieval by chat
  const messages = app.findCollectionByNameOrId("messages")
  messages.indexes = [
    "CREATE INDEX idx_messages_chat ON messages (chat)",
    "CREATE INDEX idx_messages_sender ON messages (sender)"
  ]
  app.save(messages)

  // Index on chats.space for fast chat listing by space
  const chats = app.findCollectionByNameOrId("chats")
  chats.indexes = [
    "CREATE INDEX idx_chats_space ON chats (space)",
    "CREATE INDEX idx_chats_type ON chats (type)"
  ]
  app.save(chats)

  // Index on space_members for fast membership lookups
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.indexes = [
    "CREATE INDEX idx_space_members_space ON space_members (space)",
    "CREATE INDEX idx_space_members_user ON space_members (user)"
  ]
  app.save(spaceMembers)

  return null
}, (app) => {
  // Rollback: remove all indexes
  const messages = app.findCollectionByNameOrId("messages")
  messages.indexes = []
  app.save(messages)

  const chats = app.findCollectionByNameOrId("chats")
  chats.indexes = []
  app.save(chats)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.indexes = []
  app.save(spaceMembers)

  return null
})
