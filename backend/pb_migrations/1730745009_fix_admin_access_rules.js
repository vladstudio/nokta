/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Update space_members to allow admins to manage members
  const spaceMembers = app.findCollectionByNameOrId("space_members")

  // Allow authenticated users to create members
  // In the future, we can refine this to check if user is space admin
  spaceMembers.createRule = "@request.auth.id != ''"

  // Allow space admins to update member roles
  spaceMembers.updateRule = "@request.auth.id != ''"

  // Allow space admins to remove members
  spaceMembers.deleteRule = "@request.auth.id != ''"

  app.save(spaceMembers)

  // Update spaces to allow authenticated users to create/update
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.createRule = "@request.auth.id != ''"
  spaces.updateRule = "@request.auth.id != ''"
  app.save(spaces)

  return null
}, (app) => {
  // Rollback
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  spaceMembers.deleteRule = null
  app.save(spaceMembers)

  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.createRule = null
  spaces.updateRule = null
  app.save(spaces)

  return null
})
