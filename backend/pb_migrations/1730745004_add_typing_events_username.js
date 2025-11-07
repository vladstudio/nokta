/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add userName field to typing_events collection
  const typingEvents = app.findCollectionByNameOrId("typing_events")

  typingEvents.fields.addAt(3, new Field({
    name: "userName",
    type: "text",
    required: false,
    max: 255
  }))

  app.save(typingEvents)

  return null
}, (app) => {
  // Rollback: remove userName field
  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.fields.removeById(typingEvents.fields.getByName("userName").id)
  app.save(typingEvents)

  return null
})
