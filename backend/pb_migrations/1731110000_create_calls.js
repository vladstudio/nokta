/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const calls = new Collection({
    name: "calls",
    type: "base"
  })

  const spaces = app.findCollectionByNameOrId("spaces")
  const users = app.findCollectionByNameOrId("users")

  calls.fields.addAt(0, new Field({
    name: "space",
    type: "relation",
    required: true,
    collectionId: spaces.id,
    cascadeDelete: true,
    maxSelect: 1
  }))

  calls.fields.addAt(1, new Field({
    name: "initiator",
    type: "relation",
    required: true,
    collectionId: users.id,
    maxSelect: 1
  }))

  calls.fields.addAt(2, new Field({
    name: "participants",
    type: "relation",
    required: false,
    collectionId: users.id,
    maxSelect: 999
  }))

  calls.fields.addAt(3, new Field({
    name: "daily_room_url",
    type: "text",
    required: true
  }))

  calls.fields.addAt(4, new Field({
    name: "daily_room_name",
    type: "text",
    required: true
  }))

  calls.fields.addAt(5, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  calls.listRule = '@request.auth.id != ""'
  calls.viewRule = '@request.auth.id != ""'
  calls.createRule = '@request.auth.id != ""'
  calls.updateRule = '@request.auth.id != "" && (initiator = @request.auth.id || participants ?= @request.auth.id)'
  calls.deleteRule = '@request.auth.id != "" && initiator = @request.auth.id'

  calls.indexes = ["CREATE INDEX idx_calls_space ON calls(space)"]

  app.save(calls)
  return null
}, (app) => {
  const calls = app.findCollectionByNameOrId("calls")
  app.delete(calls)
  return null
})
