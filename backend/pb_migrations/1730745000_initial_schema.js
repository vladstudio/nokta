/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create spaces collection
  const spaces = new Collection({
    name: "spaces",
    type: "base"
  })

  spaces.fields.addAt(0, new Field({
    name: "name",
    type: "text",
    required: true,
    presentable: true,
    min: 1,
    max: 100,
    pattern: ""
  }))

  spaces.fields.addAt(1, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  spaces.fields.addAt(2, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  app.save(spaces)

  // Create space_members collection
  const spaceMembers = new Collection({
    name: "space_members",
    type: "base"
  })

  spaceMembers.fields.addAt(0, new Field({
    name: "space",
    type: "relation",
    required: true,
    collectionId: spaces.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  spaceMembers.fields.addAt(1, new Field({
    name: "user",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  spaceMembers.fields.addAt(2, new Field({
    name: "role",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["admin", "member"]
  }))

  spaceMembers.fields.addAt(3, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  spaceMembers.fields.addAt(4, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  app.save(spaceMembers)

  // Create chats collection
  const chats = new Collection({
    name: "chats",
    type: "base"
  })

  chats.fields.addAt(0, new Field({
    name: "space",
    type: "relation",
    required: true,
    collectionId: spaces.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  chats.fields.addAt(1, new Field({
    name: "type",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["public", "private"]
  }))

  chats.fields.addAt(2, new Field({
    name: "participants",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 999,
    minSelect: 0
  }))

  chats.fields.addAt(3, new Field({
    name: "name",
    type: "text",
    required: false,
    min: 0,
    max: 100,
    pattern: ""
  }))

  chats.fields.addAt(4, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  chats.fields.addAt(5, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  app.save(chats)

  // Create messages collection
  const messages = new Collection({
    name: "messages",
    type: "base"
  })

  messages.fields.addAt(0, new Field({
    name: "chat",
    type: "relation",
    required: true,
    collectionId: chats.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  messages.fields.addAt(1, new Field({
    name: "sender",
    type: "relation",
    required: false,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: false,
    maxSelect: 1,
    minSelect: 0
  }))

  messages.fields.addAt(2, new Field({
    name: "type",
    type: "select",
    required: true,
    maxSelect: 1,
    values: ["text", "image", "file"]
  }))

  messages.fields.addAt(3, new Field({
    name: "content",
    type: "text",
    required: false,
    min: 1,
    max: 10000,
    pattern: ""
  }))

  messages.fields.addAt(4, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  messages.fields.addAt(5, new Field({
    name: "updated",
    type: "autodate",
    onCreate: true,
    onUpdate: true
  }))

  app.save(messages)

  // Create typing_events collection
  const typingEvents = new Collection({
    name: "typing_events",
    type: "base"
  })

  typingEvents.fields.addAt(0, new Field({
    name: "chat",
    type: "relation",
    required: true,
    collectionId: chats.id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  typingEvents.fields.addAt(1, new Field({
    name: "user",
    type: "relation",
    required: true,
    collectionId: app.findCollectionByNameOrId("users").id,
    cascadeDelete: true,
    maxSelect: 1,
    minSelect: 0
  }))

  typingEvents.fields.addAt(2, new Field({
    name: "created",
    type: "autodate",
    onCreate: true,
    onUpdate: false
  }))

  app.save(typingEvents)

  // Update users collection
  const users = app.findCollectionByNameOrId("users")

  users.fields.addAt(0, new Field({
    name: "name",
    type: "text",
    required: false,
    min: 1,
    max: 100,
    pattern: ""
  }))

  users.fields.addAt(1, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880
  }))

  users.fields.addAt(2, new Field({
    name: "last_seen",
    type: "date",
    required: false
  }))

  app.save(users)

  return null
}, (app) => {
  // Rollback: delete collections in reverse order
  const typingEvents = app.findCollectionByNameOrId("typing_events")
  app.delete(typingEvents)

  const messages = app.findCollectionByNameOrId("messages")
  app.delete(messages)

  const chats = app.findCollectionByNameOrId("chats")
  app.delete(chats)

  const spaceMembers = app.findCollectionByNameOrId("space_members")
  app.delete(spaceMembers)

  const spaces = app.findCollectionByNameOrId("spaces")
  app.delete(spaces)

  // Remove fields from users
  const users = app.findCollectionByNameOrId("users")
  users.fields.removeById(users.fields.getByName("name").id)
  users.fields.removeById(users.fields.getByName("avatar").id)
  users.fields.removeById(users.fields.getByName("last_seen").id)
  app.save(users)

  return null
})
