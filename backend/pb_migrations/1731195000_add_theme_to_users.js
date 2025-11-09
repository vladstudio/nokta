/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add theme field to users collection
  const users = app.findCollectionByNameOrId("users")

  users.fields.addAt(4, new Field({
    name: "theme",
    type: "select",
    required: false,
    maxSelect: 1,
    values: ["default", "wooden"]
  }))

  app.save(users)

  return null
}, (app) => {
  // Rollback: remove theme field from users
  const users = app.findCollectionByNameOrId("users")
  const themeField = users.fields.getByName("theme")

  if (themeField) {
    users.fields.removeById(themeField.id)
  }

  app.save(users)

  return null
})
