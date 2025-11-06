/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("spaces")
  
  // Update schema to include name field
  collection.schema = [
    {
      name: "name",
      type: "text",
      required: false,
      options: {
        min: null,
        max: null,
        pattern: ""
      }
    }
  ]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("spaces")
  
  // Remove name field by resetting schema to empty
  collection.schema = []

  return app.save(collection)
})
