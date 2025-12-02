/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create chats collection
  const chats = new Collection({
    name: "chats",
    type: "base"
  })

  chats.fields.addAt(0, new Field({
    name: "participants",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 999,
    minSelect: 0
  }))

  chats.fields.addAt(1, new Field({
    name: "name",
    type: "text",
    required: false,
    min: 0,
    max: 100,
    pattern: ""
  }))

  chats.fields.addAt(2, new Field({
    name: "last_message_at",
    type: "date",
    required: false
  }))

  chats.fields.addAt(3, new Field({
    name: "last_message_content",
    type: "text",
    required: false
  }))

  chats.fields.addAt(4, new Field({
    name: "last_message_sender",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    maxSelect: 1
  }))

  chats.fields.addAt(5, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880,
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }))

  chats.fields.addAt(6, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  chats.fields.addAt(7, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  chats.fields.addAt(8, new Field({
    name: "daily_room_url",
    type: "text",
    required: false,
    min: 0,
    max: 500,
    pattern: ""
  }))

  chats.fields.addAt(9, new Field({
    name: "is_active_call",
    type: "bool",
    required: false
  }))

  chats.fields.addAt(10, new Field({
    name: "call_participants",
    type: "json",
    required: false
  }))

  chats.fields.addAt(11, new Field({
    name: "created_by",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 1,
    minSelect: 0
  }))

  chats.listRule = 'participants.id ?= @request.auth.id'
  chats.viewRule = 'participants.id ?= @request.auth.id'
  chats.createRule = '@request.auth.id != ""'
  chats.updateRule = 'participants.id ?= @request.auth.id'
  chats.deleteRule = 'participants.id ?= @request.auth.id'

  chats.indexes = [
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
    required: true,
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
    values: ["text", "image", "file", "video", "voice"]
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
    maxSize: 104857600,
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

  messages.fields.addAt(7, new Field({
    name: "reactions",
    type: "json",
    required: false
  }))

  messages.listRule = 'chat.participants.id ?= @request.auth.id'
  messages.viewRule = 'chat.participants.id ?= @request.auth.id'
  messages.createRule = 'chat.participants.id ?= @request.auth.id'
  messages.updateRule = 'chat.participants.id ?= @request.auth.id'
  messages.deleteRule = 'sender = @request.auth.id'

  messages.indexes = [
    "CREATE INDEX idx_messages_chat ON messages (chat)",
    "CREATE INDEX idx_messages_sender ON messages (sender)"
  ]

  app.save(messages)

  // Add self-referencing fields after collection is saved
  const savedMessages = app.findCollectionByNameOrId("messages")
  savedMessages.fields.addAt(8, new Field({
    name: "reply_to",
    type: "relation",
    required: false,
    collectionId: savedMessages.id,
    cascadeDelete: false,
    maxSelect: 1
  }))
  savedMessages.fields.addAt(9, new Field({
    name: "forwarded_from",
    type: "relation",
    required: false,
    collectionId: savedMessages.id,
    cascadeDelete: false,
    maxSelect: 1
  }))
  app.save(savedMessages)

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

  typingEvents.listRule = 'chat.participants.id ?= @request.auth.id'
  typingEvents.viewRule = 'chat.participants.id ?= @request.auth.id'
  typingEvents.createRule = 'chat.participants.id ?= @request.auth.id'
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

  chatReadStatus.listRule = 'user = @request.auth.id'
  chatReadStatus.viewRule = 'user = @request.auth.id'
  chatReadStatus.createRule = '@request.auth.id != "" && user = @request.auth.id'
  chatReadStatus.updateRule = 'user = @request.auth.id'
  chatReadStatus.deleteRule = 'user = @request.auth.id'

  chatReadStatus.indexes = [
    "CREATE UNIQUE INDEX idx_unique_user_chat_read_status ON chat_read_status (user, chat)",
    "CREATE INDEX idx_chat_read_status_user ON chat_read_status (user)"
  ]

  app.save(chatReadStatus)

  // Create invitations collection
  const invitations = new Collection({
    name: "invitations",
    type: "base"
  })

  invitations.fields.addAt(0, new Field({
    name: "code",
    type: "text",
    required: true,
    min: 32,
    max: 32
  }))

  invitations.fields.addAt(1, new Field({
    name: "invited_by",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: true,
    maxSelect: 1
  }))

  invitations.fields.addAt(2, new Field({
    name: "expires_at",
    type: "date",
    required: true
  }))

  invitations.fields.addAt(3, new Field({
    name: "used",
    type: "bool",
    required: false
  }))

  invitations.fields.addAt(4, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  invitations.listRule = ''
  invitations.viewRule = ''
  invitations.createRule = '@request.auth.id != ""'
  invitations.updateRule = '@request.auth.id != ""'
  invitations.deleteRule = 'invited_by = @request.auth.id'

  invitations.indexes = [
    "CREATE UNIQUE INDEX idx_invitations_code ON invitations (code)"
  ]

  app.save(invitations)

  // Update users collection
  const users = app.findCollectionByNameOrId("users")

  const verifiedField = users.fields.getByName("verified")
  if (verifiedField) {
    users.fields.removeById(verifiedField.id)
  }

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
    name: "birthday",
    type: "date",
    required: false
  }))

  users.fields.addAt(4, new Field({
    name: "role",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["Member", "Admin"]
  }))

  users.fields.getByName("role").default = "Member"

  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'
  users.createRule = ''
  users.updateRule = '@request.auth.role = "Admin" || @request.auth.id = id'
  users.deleteRule = '@request.auth.role = "Admin"'

  app.save(users)

  return null
}, (app) => {
  const invitations = app.findCollectionByNameOrId("invitations")
  app.delete(invitations)

  const chatReadStatus = app.findCollectionByNameOrId("chat_read_status")
  app.delete(chatReadStatus)

  const typingEvents = app.findCollectionByNameOrId("typing_events")
  app.delete(typingEvents)

  const messages = app.findCollectionByNameOrId("messages")
  app.delete(messages)

  const chats = app.findCollectionByNameOrId("chats")
  app.delete(chats)

  const users = app.findCollectionByNameOrId("users")
  const nameField = users.fields.getByName("name")
  const avatarField = users.fields.getByName("avatar")
  const lastSeenField = users.fields.getByName("last_seen")
  const birthdayField = users.fields.getByName("birthday")
  const roleField = users.fields.getByName("role")

  if (nameField) users.fields.removeById(nameField.id)
  if (avatarField) users.fields.removeById(avatarField.id)
  if (lastSeenField) users.fields.removeById(lastSeenField.id)
  if (birthdayField) users.fields.removeById(birthdayField.id)
  if (roleField) users.fields.removeById(roleField.id)

  users.listRule = null
  users.viewRule = null
  users.createRule = null
  users.updateRule = null
  users.deleteRule = null

  app.save(users)

  return null
})
