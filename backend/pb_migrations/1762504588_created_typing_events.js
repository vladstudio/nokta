/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "typing_events",
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
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: app.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("typing_events")
  return app.delete(collection)
})
