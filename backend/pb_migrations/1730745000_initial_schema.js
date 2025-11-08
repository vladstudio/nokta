/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ============================================
  // COLLECTIONS
  // ============================================

  // Create spaces collection
  const spaces = new Collection({
    name: "spaces",
    type: "base"
  })

  spaces.fields.addAt(0, new Field({
    name: "name",
    type: "text",
    required: true,
    presentable: true,
    min: 1,
    max: 100,
    pattern: ""
  }))

  spaces.fields.addAt(1, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  spaces.fields.addAt(2, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  // Temporary basic rules (will be updated after space_members is created)
  spaces.listRule = '@request.auth.id != ""'
  spaces.viewRule = '@request.auth.id != ""'
  spaces.createRule = '@request.auth.id != ""'
  spaces.updateRule = null
  spaces.deleteRule = null

  app.save(spaces)

  // Create space_members collection
  const spaceMembers = new Collection({
    name: "space_members",
    type: "base"
  })

  spaceMembers.fields.addAt(0, new Field({
    name: "space",
    type: "relation",
    required: true,
    collectionId: spaces.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  spaceMembers.fields.addAt(1, new Field({
    name: "user",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false, // Don't cascade delete when user is deleted
    maxSelect: 1,
    minSelect: 0
  }))

  spaceMembers.fields.addAt(2, new Field({
    name: "role",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["admin", "member"]
  }))

  spaceMembers.fields.addAt(3, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  spaceMembers.fields.addAt(4, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  // Temporary basic rules (will be updated after all collections are created)
  spaceMembers.listRule = '@request.auth.id != ""'
  spaceMembers.viewRule = '@request.auth.id != ""'
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null

  // Indexes
  spaceMembers.indexes = [
    "CREATE UNIQUE INDEX idx_unique_space_member ON space_members (space, user)",
    "CREATE INDEX idx_space_members_space ON space_members (space)",
    "CREATE INDEX idx_space_members_user ON space_members (user)"
  ]

  app.save(spaceMembers)

  // Create chats collection
  const chats = new Collection({
    name: "chats",
    type: "base"
  })

  chats.fields.addAt(0, new Field({
    name: "space",
    type: "relation",
    required: true,
    collectionId: spaces.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  chats.fields.addAt(1, new Field({
    name: "type",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["public", "private"]
  }))

  chats.fields.addAt(2, new Field({
    name: "participants",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 999,
    minSelect: 0
  }))

  chats.fields.addAt(3, new Field({
    name: "name",
    type: "text",
    required: false,
    min: 0,
    max: 100,
    pattern: ""
  }))

  chats.fields.addAt(4, new Field({
    name: "last_message_at",
    type: "date",
    required: false
  }))

  chats.fields.addAt(5, new Field({
    name: "last_message_content",
    type: "text",
    required: false
  }))

  chats.fields.addAt(6, new Field({
    name: "last_message_sender",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    maxSelect: 1
  }))

  chats.fields.addAt(7, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880, // 5MB
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }))

  chats.fields.addAt(8, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  chats.fields.addAt(9, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  // Access rules: authenticated users can create chats, backend manages updates/deletes
  chats.listRule = '@request.auth.id != ""'
  chats.viewRule = '@request.auth.id != ""'
  chats.createRule = '@request.auth.id != ""'
  chats.updateRule = null
  chats.deleteRule = null

  // Indexes
  chats.indexes = [
    "CREATE INDEX idx_chats_space ON chats (space)",
    "CREATE INDEX idx_chats_type ON chats (type)",
    "CREATE INDEX idx_chats_participants ON chats (participants)"
  ]

  app.save(chats)

  // Create messages collection
  const messages = new Collection({
    name: "messages",
    type: "base"
  })

  messages.fields.addAt(0, new Field({
    name: "chat",
    type: "relation",
    required: true,
    collectionId: chats.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  messages.fields.addAt(1, new Field({
    name: "sender",
    type: "relation",
    required: true, // Made required
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 1,
    minSelect: 0
  }))

  messages.fields.addAt(2, new Field({
    name: "type",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["text", "image", "file"]
  }))

  messages.fields.addAt(3, new Field({
    name: "content",
    type: "text",
    required: false,
    min: 1,
    max: 10000,
    pattern: ""
  }))

  messages.fields.addAt(4, new Field({
    name: "file",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 52428800, // 50MB
    thumbs: ["100x100", "300x300", "600x600"]
  }))

  messages.fields.addAt(5, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  messages.fields.addAt(6, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  // Temporary basic rules (will be updated after all collections are created)
  messages.listRule = '@request.auth.id != ""'
  messages.viewRule = '@request.auth.id != ""'
  messages.createRule = '@request.auth.id != ""'
  messages.updateRule = "sender = @request.auth.id"
  messages.deleteRule = "sender = @request.auth.id"

  // Indexes
  messages.indexes = [
    "CREATE INDEX idx_messages_chat ON messages (chat)",
    "CREATE INDEX idx_messages_sender ON messages (sender)"
  ]

  app.save(messages)

  // Create typing_events collection
  const typingEvents = new Collection({
    name: "typing_events",
    type: "base"
  })

  typingEvents.fields.addAt(0, new Field({
    name: "chat",
    type: "relation",
    required: true,
    collectionId: chats.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  typingEvents.fields.addAt(1, new Field({
    name: "user",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  typingEvents.fields.addAt(2, new Field({
    name: "userName",
    type: "text",
    required: false,
    max: 255
  }))

  typingEvents.fields.addAt(3, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  // Access rules: ephemeral data
  typingEvents.listRule = '@request.auth.id != ""'
  typingEvents.viewRule = '@request.auth.id != ""'
  typingEvents.createRule = '@request.auth.id != ""'
  typingEvents.updateRule = null
  typingEvents.deleteRule = '@request.auth.id != ""'

  app.save(typingEvents)

  // Create chat_read_status collection
  const chatReadStatus = new Collection({
    name: "chat_read_status",
    type: "base"
  })

  chatReadStatus.fields.addAt(0, new Field({
    name: "user",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  chatReadStatus.fields.addAt(1, new Field({
    name: "chat",
    type: "relation",
    required: true,
    collectionId: chats.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  chatReadStatus.fields.addAt(2, new Field({
    name: "last_read_at",
    type: "date",
    required: true
  }))

  chatReadStatus.fields.addAt(3, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  chatReadStatus.fields.addAt(4, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  // Access rules: users can only see/manage their own read status
  chatReadStatus.listRule = 'user = @request.auth.id'
  chatReadStatus.viewRule = 'user = @request.auth.id'
  chatReadStatus.createRule = '@request.auth.id != "" && user = @request.auth.id'
  chatReadStatus.updateRule = 'user = @request.auth.id'
  chatReadStatus.deleteRule = 'user = @request.auth.id'

  // Indexes
  chatReadStatus.indexes = [
    "CREATE UNIQUE INDEX idx_unique_user_chat_read_status ON chat_read_status (user, chat)",
    "CREATE INDEX idx_chat_read_status_user ON chat_read_status (user)"
  ]

  app.save(chatReadStatus)

  // Update users collection
  const users = app.findCollectionByNameOrId("users")

  users.fields.addAt(0, new Field({
    name: "name",
    type: "text",
    required: false,
    min: 1,
    max: 100,
    pattern: ""
  }))

  users.fields.addAt(1, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880
  }))

  users.fields.addAt(2, new Field({
    name: "last_seen",
    type: "date",
    required: false
  }))

  users.fields.addAt(3, new Field({
    name: "language",
    type: "select",
    required: false,
    maxSelect: 1,
    values: ["en", "ru"]
  }))

  // Access rules: users can view others, but only modify themselves
  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.updateRule = 'id = @request.auth.id'
  users.deleteRule = 'id = @request.auth.id'

  app.save(users)

  // ============================================
  // Note: Complex access rules with reverse relations should be configured
  // via the PocketBase admin UI after initial setup, as they cannot be
  // properly validated during the first migration run.
  // The basic rules set above allow authenticated access for initial setup.
  // ============================================

  return null
}, (app) => {
  // Rollback: delete collections in reverse order
  const chatReadStatus = app.findCollectionByNameOrId("chat_read_status")
  app.delete(chatReadStatus)

  const typingEvents = app.findCollectionByNameOrId("typing_events")
  app.delete(typingEvents)

  const messages = app.findCollectionByNameOrId("messages")
  app.delete(messages)

  const chats = app.findCollectionByNameOrId("chats")
  app.delete(chats)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  app.delete(spaceMembers)

  const spaces = app.findCollectionByNameId("spaces")
  app.delete(spaces)

  // Remove fields from users
  const users = app.findCollectionByNameOrId("users")
  const nameField = users.fields.getByName("name")
  const avatarField = users.fields.getByName("avatar")
  const lastSeenField = users.fields.getByName("last_seen")
  const languageField = users.fields.getByName("language")

  if (nameField) users.fields.removeById(nameField.id)
  if (avatarField) users.fields.removeById(avatarField.id)
  if (lastSeenField) users.fields.removeById(lastSeenField.id)
  if (languageField) users.fields.removeById(languageField.id)

  users.listRule = null
  users.viewRule = null
  users.updateRule = null
  users.deleteRule = null

  app.save(users)

  return null
})
