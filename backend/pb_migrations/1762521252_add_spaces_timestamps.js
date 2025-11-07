/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("spaces")

  // add created field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "autodate2990389177",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add updated field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "autodate3332085496",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("spaces")

  // remove created field
  collection.fields.removeById("autodate2990389177")

  // remove updated field
  collection.fields.removeById("autodate3332085496")

  return app.save(collection)
})
