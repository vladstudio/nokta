/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  chats.fields.addAt(8, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880, // 5MB
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }))

  app.save(chats)
  return null
}, (app) => {
  const chats = app.findCollectionByNameOrId("chats")
  chats.fields.removeById(chats.fields.getByName("avatar").id)
  app.save(chats)
  return null
})
