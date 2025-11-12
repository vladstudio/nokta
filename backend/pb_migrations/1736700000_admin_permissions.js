/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Update spaces collection to allow admin users to update and delete
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.updateRule = '@request.auth.role = "Admin"'
  spaces.deleteRule = '@request.auth.role = "Admin"'
  app.save(spaces)

  // Update users collection to allow admin users to create, update, and delete users
  const users = app.findCollectionByNameOrId("users")
  users.createRule = '@request.auth.role = "Admin"'
  users.updateRule = '@request.auth.role = "Admin" || @request.auth.id = id'
  users.deleteRule = '@request.auth.role = "Admin"'
  app.save(users)
}, (app) => {
  // Rollback: restore original rules
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.updateRule = null
  spaces.deleteRule = null
  app.save(spaces)

  const users = app.findCollectionByNameOrId("users")
  users.createRule = null
  users.updateRule = '@request.auth.id = id'
  users.deleteRule = null
  app.save(users)
})
