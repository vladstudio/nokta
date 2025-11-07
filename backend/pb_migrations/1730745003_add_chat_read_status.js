/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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
    collectionId: app.findCollectionByNameOrId("chats").id,
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

  // Set access rules: Users can only see/manage their own read status
  chatReadStatus.listRule = 'user = @request.auth.id'
  chatReadStatus.viewRule = 'user = @request.auth.id'
  chatReadStatus.createRule = '@request.auth.id != "" && user = @request.auth.id'
  chatReadStatus.updateRule = 'user = @request.auth.id'
  chatReadStatus.deleteRule = 'user = @request.auth.id'

  app.save(chatReadStatus)

  // Add unique constraint to prevent duplicate read status per user-chat
  chatReadStatus.indexes = chatReadStatus.indexes || []
  chatReadStatus.indexes.push(
    "CREATE UNIQUE INDEX idx_unique_user_chat_read_status ON chat_read_status (user, chat)"
  )
  chatReadStatus.indexes.push(
    "CREATE INDEX idx_chat_read_status_user ON chat_read_status (user)"
  )
  app.save(chatReadStatus)

  return null
}, (app) => {
  // Rollback: delete chat_read_status collection
  const chatReadStatus = app.findCollectionByNameOrId("chat_read_status")
  app.delete(chatReadStatus)

  return null
})
