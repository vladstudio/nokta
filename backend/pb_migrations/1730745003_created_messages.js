/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "messages",
    type: "base",
    schema: [
      {
        name: "chat",
        type: "relation",
        required: true,
        options: {
          collectionId: app.findCollectionByNameOrId("chats").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      {
        name: "sender",
        type: "relation",
        required: false,
        options: {
          collectionId: app.findCollectionByNameOrId("users").id,
          cascadeDelete: false,
          maxSelect: 1,
        },
      },
      {
        name: "type",
        type: "select",
        required: true,
        options: {
          values: ["text"],
        },
      },
      {
        name: "content",
        type: "text",
        required: true,
      },
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("messages")
  return app.delete(collection)
})
