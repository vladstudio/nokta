/// <reference path="../pb_data/types.d.ts" />
// Temporary: Allow authenticated users to create/update spaces for testing
migrate((app) => {
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.createRule = "@request.auth.id != ''"
  spaces.updateRule = "@request.auth.id != ''"
  app.save(spaces)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.createRule = "@request.auth.id != ''"
  spaceMembers.updateRule = "@request.auth.id != ''"
  app.save(spaceMembers)

  return null
}, (app) => {
  const spaces = app.findCollectionByNameOrId("spaces")
  spaces.createRule = null
  spaces.updateRule = null
  app.save(spaces)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.createRule = null
  spaceMembers.updateRule = null
  app.save(spaceMembers)

  return null
})
