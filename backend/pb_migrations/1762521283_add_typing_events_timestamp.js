/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("typing_events")

  // add created field (useful for TTL-based cleanup)
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "autodate2990389180",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("typing_events")

  // remove created field
  collection.fields.removeById("autodate2990389180")

  return app.save(collection)
})
