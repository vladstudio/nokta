/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")
  const users = app.findCollectionByNameOrId("users")

  chats.fields.addAt(13, new Field({
    name: "created_by",
    type: "relation",
    required: false,
    collectionId: users.id,
    cascadeDelete: false,
    maxSelect: 1,
    minSelect: 0
  }))

  app.save(chats)

  return null
}, (app) => {
  const chats = app.findCollectionByNameOrId("chats")
  const createdByField = chats.fields.getByName("created_by")

  if (createdByField) {
    chats.fields.removeById(createdByField.id)
  }

  app.save(chats)

  return null
})
