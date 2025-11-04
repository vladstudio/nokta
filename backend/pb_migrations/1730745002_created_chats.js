/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "chats",
    type: "base",
    schema: [
      {
        name: "space",
        type: "relation",
        required: true,
        options: {
          collectionId: app.findCollectionByNameOrId("spaces").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      {
        name: "type",
        type: "select",
        required: true,
        options: {
          values: ["public", "private"],
        },
      },
      {
        name: "participants",
        type: "relation",
        required: false,
        options: {
          collectionId: app.findCollectionByNameOrId("users").id,
          cascadeDelete: false,
          maxSelect: 999,
        },
      },
      {
        name: "name",
        type: "text",
        required: false,
      },
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("chats")
  return app.delete(collection)
})
