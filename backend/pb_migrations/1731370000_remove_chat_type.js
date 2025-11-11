/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const chats = app.findCollectionByNameOrId("chats")

  // Remove the type field
  const typeField = chats.fields.getByName("type")
  if (typeField) {
    chats.fields.removeById(typeField.id)
  }

  // Remove the index on type
  chats.indexes = [
    "CREATE INDEX idx_chats_space ON chats (space)",
    "CREATE INDEX idx_chats_participants ON chats (participants)"
  ]

  app.save(chats)

  return null
}, (app) => {
  // Rollback: restore the type field
  const chats = app.findCollectionByNameOrId("chats")

  chats.fields.addAt(1, new Field({
    name: "type",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["public", "private"]
  }))

  chats.indexes = [
    "CREATE INDEX idx_chats_space ON chats (space)",
    "CREATE INDEX idx_chats_type ON chats (type)",
    "CREATE INDEX idx_chats_participants ON chats (participants)"
  ]

  app.save(chats)

  return null
})
