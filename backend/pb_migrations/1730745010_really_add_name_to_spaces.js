/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("spaces")
  
  // Get current schema and add name field
  collection.schema = [
    {
      "system": false,
      "id": "nametext999",
      "name": "name",
      "type": "text",
      "required": false,
      "presentable": true,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "pattern": ""
      }
    }
  ]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("spaces")
  
  // Remove name field
  collection.schema = []

  return app.save(collection)
})
