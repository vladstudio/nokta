/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const calls = app.findCollectionByNameOrId("calls")

  // Update rules first (remove initiator references)
  calls.listRule = '@request.auth.id != ""'
  calls.viewRule = '@request.auth.id != ""'
  calls.createRule = '@request.auth.id != ""'
  // Allow participants to update, or anyone authenticated (invite acceptance handled by app logic)
  calls.updateRule = '@request.auth.id != ""'
  calls.deleteRule = '@request.auth.id != ""'

  // Remove initiator field if it exists
  const initiatorField = calls.fields.getByName("initiator")
  if (initiatorField) {
    calls.fields.removeById(initiatorField.id)
  }
  app.save(calls)

  // Get fresh references
  const callsAfterSave = app.findCollectionByNameOrId("calls")
  const users = app.findCollectionByNameOrId("users")

  // Create call_invites collection
  const collection = new Collection({
    name: "call_invites",
    type: "base"
  })

  collection.fields.addAt(0, new Field({
    name: "call",
    type: "relation",
    required: true,
    collectionId: callsAfterSave.id,
    cascadeDelete: true,
    maxSelect: 1
  }))

  collection.fields.addAt(1, new Field({
    name: "inviter",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: true,
    maxSelect: 1
  }))

  collection.fields.addAt(2, new Field({
    name: "invitee",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: true,
    maxSelect: 1
  }))

  collection.fields.addAt(3, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  collection.listRule = '@request.auth.id != "" && (inviter = @request.auth.id || invitee = @request.auth.id)'
  collection.viewRule = '@request.auth.id != "" && (inviter = @request.auth.id || invitee = @request.auth.id)'
  collection.createRule = '@request.auth.id != "" && inviter = @request.auth.id'
  collection.updateRule = null
  collection.deleteRule = '@request.auth.id != "" && (inviter = @request.auth.id || invitee = @request.auth.id)'

  app.save(collection)
  return null
}, (app) => {
  const collection = app.findCollectionByNameOrId("call_invites")
  app.delete(collection)

  const calls = app.findCollectionByNameOrId("calls")
  const users = app.findCollectionByNameOrId("users")

  calls.fields.addAt(1, new Field({
    name: "initiator",
    type: "relation",
    required: true,
    collectionId: users.id,
    maxSelect: 1
  }))

  // Restore old rules
  calls.listRule = '@request.auth.id != ""'
  calls.viewRule = '@request.auth.id != ""'
  calls.createRule = '@request.auth.id != ""'
  calls.updateRule = '@request.auth.id != "" && (initiator = @request.auth.id || participants ?= @request.auth.id)'
  calls.deleteRule = '@request.auth.id != "" && initiator = @request.auth.id'

  app.save(calls)
  return null
})
