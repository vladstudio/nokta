/// <reference path="../pb_data/types.d.ts" />

// Auto-create space-wide public chat when a space is created
onRecordAfterCreateSuccess((e) => {
  const chatsCollection = e.app.findCollectionByNameOrId("chats")
  const chat = new Record(chatsCollection)

  chat.set("space", e.record.id)
  chat.set("type", "public")
  chat.set("name", "General")
  chat.set("participants", [])

  e.app.save(chat)

  e.next()
}, "spaces")

// Auto-create DM chats when a space member is added
onRecordAfterCreateSuccess((e) => {
  const newUserId = e.record.get("user")
  const spaceId = e.record.get("space")

  // Get all existing members in this space (excluding the new member)
  const existingMembers = $app.findRecordsByFilter(
    "space_members",
    `space = {:spaceId} && user != {:userId}`,
    "-created",
    0,
    0,
    { spaceId, userId: newUserId }
  )

  const chatsCollection = e.app.findCollectionByNameOrId("chats")

  // Create a DM chat between the new member and each existing member
  arrayOf(existingMembers).forEach((member) => {
    const existingUserId = member.get("user")

    // Check if DM chat already exists between these two users in this space
    try {
      $app.findFirstRecordByFilter(
        "chats",
        `space = {:spaceId} && type = "private" && participants.id ?= {:userId1} && participants.id ?= {:userId2}`,
        { spaceId, userId1: newUserId, userId2: existingUserId }
      )
      // Chat already exists, skip
    } catch (err) {
      // Chat doesn't exist, create it
      const dmChat = new Record(chatsCollection)
      dmChat.set("space", spaceId)
      dmChat.set("type", "private")
      dmChat.set("participants", [newUserId, existingUserId])

      e.app.save(dmChat)
    }
  })

  e.next()
}, "space_members")
