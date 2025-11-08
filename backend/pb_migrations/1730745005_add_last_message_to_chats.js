/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  chats.fields.addAt(5, new Field({
    name: "last_message_at",
    type: "date",
    required: false
  }))

  chats.fields.addAt(6, new Field({
    name: "last_message_content",
    type: "text",
    required: false
  }))

  chats.fields.addAt(7, new Field({
    name: "last_message_sender",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    maxSelect: 1
  }))

  app.save(chats)
  return null
}, (app) => {
  const chats = app.findCollectionByNameOrId("chats")
  chats.fields.removeById(chats.fields.getByName("last_message_at").id)
  chats.fields.removeById(chats.fields.getByName("last_message_content").id)
  chats.fields.removeById(chats.fields.getByName("last_message_sender").id)
  app.save(chats)
  return null
})
