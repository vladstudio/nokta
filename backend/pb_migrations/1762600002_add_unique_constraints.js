/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Add unique constraints to prevent duplicate data

  // Prevent duplicate space memberships (same user in same space)
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.indexes = spaceMembers.indexes || []
  spaceMembers.indexes.push(
    "CREATE UNIQUE INDEX idx_unique_space_member ON space_members (space, user)"
  )
  app.save(spaceMembers)

  return null
}, (app) => {
  // Rollback: remove unique constraint
  const spaceMembers = app.findCollectionByNameOrId("space_members")
  spaceMembers.indexes = spaceMembers.indexes.filter(
    idx => !idx.includes("idx_unique_space_member")
  )
  app.save(spaceMembers)

  return null
})
