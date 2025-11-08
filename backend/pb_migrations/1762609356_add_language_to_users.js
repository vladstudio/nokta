/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")

  // Add language field to users collection
  users.fields.addAt(users.fields.length, new Field({
    name: "language",
    type: "select",
    required: false,
    maxSelect: 1,
    values: ["en", "ru"]
  }))

  app.save(users)

  // Set default language to 'en' for all existing users
  const existingUsers = app.findRecordsByFilter("users", "", "", 0, 0)
  existingUsers.forEach((user) => {
    if (!user.get("language")) {
      user.set("language", "en")
      app.save(user)
    }
  })

  return null
}, (app) => {
  // Rollback: remove the language field
  const users = app.findCollectionByNameOrId("users")
  const languageField = users.fields.getByName("language")
  if (languageField) {
    users.fields.removeById(languageField.id)
    app.save(users)
  }
  return null
})
