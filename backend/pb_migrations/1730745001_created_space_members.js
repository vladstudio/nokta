/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "space_members",
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
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: app.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      {
        name: "role",
        type: "select",
        required: true,
        options: {
          values: ["admin", "member"],
        },
      },
      {
        name: "joined_at",
        type: "date",
      },
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("space_members")
  return app.delete(collection)
})
