/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("messages")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": app.findCollectionByNameOrId("chats").id,
    "hidden": false,
    "id": "msgchat",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "chat",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false, // Don't delete messages when user is deleted
    "collectionId": app.findCollectionByNameOrId("users").id,
    "hidden": false,
    "id": "msgsender",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "sender",
    "presentable": false,
    "required": false, // Allow null sender for system messages or deleted users
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "msgtype",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "text",
      "image",
      "file"
    ]
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "msgcontent",
    "max": 0,
    "min": 0,
    "name": "content",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("messages")

  // remove field
  collection.fields.removeById("msgchat")

  // remove field
  collection.fields.removeById("msgsender")

  // remove field
  collection.fields.removeById("msgtype")

  // remove field
  collection.fields.removeById("msgcontent")

  return app.save(collection)
})
