/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Add daily_room_url field
  chats.fields.addAt(10, new Field({
    name: "daily_room_url",
    type: "text",
    required: false,
    min: 0,
    max: 500,
    pattern: ""
  }))

  // Add is_active_call field
  chats.fields.addAt(11, new Field({
    name: "is_active_call",
    type: "bool",
    required: false
  }))

  // Add call_participants field (JSON array of user IDs currently in the call)
  chats.fields.addAt(12, new Field({
    name: "call_participants",
    type: "json",
    required: false
  }))

  app.save(chats)

  return null
}, (app) => {
  // Rollback: remove the fields
  const chats = app.findCollectionByNameOrId("chats")

  const dailyRoomUrlField = chats.fields.getByName("daily_room_url")
  const isActiveCallField = chats.fields.getByName("is_active_call")
  const callParticipantsField = chats.fields.getByName("call_participants")

  if (dailyRoomUrlField) chats.fields.removeById(dailyRoomUrlField.id)
  if (isActiveCallField) chats.fields.removeById(isActiveCallField.id)
  if (callParticipantsField) chats.fields.removeById(callParticipantsField.id)

  app.save(chats)

  return null
})
