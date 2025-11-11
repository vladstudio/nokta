/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add birthday field to users collection
  const users = app.findCollectionByNameOrId("users")

  users.fields.addAt(5, new Field({
    name: "birthday",
    type: "date",
    required: false
  }))

  app.save(users)

  return null
}, (app) => {
  // Rollback: remove birthday field from users
  const users = app.findCollectionByNameOrId("users")
  const birthdayField = users.fields.getByName("birthday")

  if (birthdayField) {
    users.fields.removeById(birthdayField.id)
  }

  app.save(users)

  return null
})
