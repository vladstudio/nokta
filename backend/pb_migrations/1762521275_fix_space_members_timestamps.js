/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("space_members")

  // remove manual joined_at field
  collection.fields.removeById("memberjoined")

  // add created field (replaces joined_at)
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "autodate2990389179",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add updated field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "autodate3332085498",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("space_members")

  // remove created field
  collection.fields.removeById("autodate2990389179")

  // remove updated field
  collection.fields.removeById("autodate3332085498")

  // restore manual joined_at field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "memberjoined",
    "max": "",
    "min": "",
    "name": "joined_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
