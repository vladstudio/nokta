/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("space_members")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": app.findCollectionByNameOrId("spaces").id,
    "hidden": false,
    "id": "memberspace",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "space",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false, // Preserve membership records when user is deleted
    "collectionId": app.findCollectionByNameOrId("users").id,
    "hidden": false,
    "id": "memberuser",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "memberrole",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "admin",
      "member"
    ]
  }))

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("space_members")

  // remove field
  collection.fields.removeById("memberspace")

  // remove field
  collection.fields.removeById("memberuser")

  // remove field
  collection.fields.removeById("memberrole")

  // remove field
  collection.fields.removeById("memberjoined")

  return app.save(collection)
})
