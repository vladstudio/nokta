/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const messages = app.findCollectionByNameOrId("messages")

  // Add file field to messages collection
  messages.fields.addAt(4, new Field({
    name: "file",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 52428800, // 50MB
    thumbs: ["100x100", "300x300", "600x600"]
  }))

  app.save(messages)
  return null
}, (app) => {
  // Rollback: remove the file field
  const messages = app.findCollectionByNameOrId("messages")
  const fileField = messages.fields.getByName("file")
  if (fileField) {
    messages.fields.removeById(fileField.id)
    app.save(messages)
  }
  return null
})
