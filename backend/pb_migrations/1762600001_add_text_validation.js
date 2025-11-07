/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add validation constraints to text fields to prevent abuse

  // Limit message content length
  const messages = app.findCollectionByNameOrId("messages")
  const contentField = messages.fields.getByName("content")
  if (contentField) {
    contentField.max = 10000 // 10k chars max per message
    contentField.min = 1 // At least 1 char
    app.save(messages)
  }

  // Limit space name length
  const spaces = app.findCollectionByNameOrId("spaces")
  const spaceNameField = spaces.fields.getByName("name")
  if (spaceNameField) {
    spaceNameField.max = 100
    spaceNameField.min = 1
    spaceNameField.required = true
    app.save(spaces)
  }

  // Limit chat name length
  const chats = app.findCollectionByNameOrId("chats")
  const chatNameField = chats.fields.getByName("name")
  if (chatNameField) {
    chatNameField.max = 100
    chatNameField.min = 0
    app.save(chats)
  }

  // Limit user name length
  const users = app.findCollectionByNameOrId("users")
  const userNameField = users.fields.getByName("name")
  if (userNameField) {
    userNameField.max = 100
    userNameField.min = 1
    app.save(users)
  }

  return null
}, (app) => {
  // Rollback: remove constraints
  const messages = app.findCollectionByNameOrId("messages")
  const contentField = messages.fields.getByName("content")
  if (contentField) {
    contentField.max = 0
    contentField.min = 0
    app.save(messages)
  }

  const spaces = app.findCollectionByNameOrId("spaces")
  const spaceNameField = spaces.fields.getByName("name")
  if (spaceNameField) {
    spaceNameField.max = 0
    spaceNameField.min = 0
    spaceNameField.required = false
    app.save(spaces)
  }

  const chats = app.findCollectionByNameOrId("chats")
  const chatNameField = chats.fields.getByName("name")
  if (chatNameField) {
    chatNameField.max = 0
    chatNameField.min = 0
    app.save(chats)
  }

  const users = app.findCollectionByNameOrId("users")
  const userNameField = users.fields.getByName("name")
  if (userNameField) {
    userNameField.max = 0
    userNameField.min = 0
    app.save(users)
  }

  return null
})
