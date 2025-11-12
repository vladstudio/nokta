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

  // Update space_members collection to allow admin users to create and delete members
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.createRule = '@request.auth.role = "Admin"'
  spaceMembers.deleteRule = '@request.auth.role = "Admin"'
  app.save(spaceMembers)
})
