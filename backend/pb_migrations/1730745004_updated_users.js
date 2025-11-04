/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  // Add name field
  collection.fields.addAt(0, new Field({
    name: "name",
    type: "text",
    required: false,
  }))

  // Add avatar field
  collection.fields.addAt(1, new Field({
    name: "avatar",
    type: "file",
    required: false,
    options: {
      maxSelect: 1,
      maxSize: 5242880,
    },
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.fields.removeById(collection.fields.getByName("name").id)
  collection.fields.removeById(collection.fields.getByName("avatar").id)

  return app.save(collection)
})
