/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("chats")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": app.findCollectionByNameOrId("spaces").id,
    "hidden": false,
    "id": "chatspace",
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
    "hidden": false,
    "id": "chattype",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "public",
      "private"
    ]
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": app.findCollectionByNameOrId("users").id,
    "hidden": false,
    "id": "chatparticipants",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "participants",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "chatname",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("chats")

  // remove field
  collection.fields.removeById("chatspace")

  // remove field
  collection.fields.removeById("chattype")

  // remove field
  collection.fields.removeById("chatparticipants")

  // remove field
  collection.fields.removeById("chatname")

  return app.save(collection)
})
