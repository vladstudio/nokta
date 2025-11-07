/// <reference path="../pb_data/types.d.ts" />

/**
 * Auto-create space-wide public chat when a space is created
 * FIX #5: Added proper error handling and logging
 */
onRecordAfterCreateSuccess((e) => {
  try {
    const chatsCollection = e.app.findCollectionByNameOrId("chats")
    const chat = new Record(chatsCollection)

    chat.set("space", e.record.id)
    chat.set("type", "public")
    chat.set("name", "General")
    chat.set("participants", [])

    e.app.save(chat)

    console.log(`[auto_create_chats] Created public chat for space ${e.record.id}`)
  } catch (err) {
    console.error(`[auto_create_chats] Failed to create public chat for space ${e.record.id}:`, err.message)
    // Don't throw - allow space creation to succeed even if chat creation fails
  }

  e.next()
}, "spaces")

/**
 * Auto-create DM chats when a space member is added
 * FIX #3: Added input validation
 * FIX #4: Fixed race condition with better duplicate detection
 * FIX #5: Added proper error handling and logging
 */
onRecordAfterCreateSuccess((e) => {
  const newUserId = e.record.get("user")
  const spaceId = e.record.get("space")

  // Validate required fields
  if (!newUserId || !spaceId) {
    console.error("[auto_create_chats] Missing required fields: user or space")
    e.next()
    return
  }

  try {
    // Verify space exists
    try {
      e.app.findRecordById("spaces", spaceId)
    } catch (err) {
      console.error(`[auto_create_chats] Space ${spaceId} not found`)
      e.next()
      return
    }

    // Verify user exists
    try {
      e.app.findRecordById("users", newUserId)
    } catch (err) {
      console.error(`[auto_create_chats] User ${newUserId} not found`)
      e.next()
      return
    }

    // Get all existing members in this space (excluding the new member)
    const existingMembers = $app.findRecordsByFilter(
      "space_members",
      `space = {:spaceId} && user != {:userId}`,
      "",
      0,
      0,
      { spaceId, userId: newUserId }
    )

    const chatsCollection = e.app.findCollectionByNameOrId("chats")
    let createdCount = 0
    let skippedCount = 0

    // Create a DM chat between the new member and each existing member
    arrayOf(existingMembers).forEach((member) => {
      const existingUserId = member.get("user")

      try {
        // Check if DM chat already exists between these two users in this space
        // FIX #4: Use sorted participant IDs for consistent lookup
        const sortedParticipants = [newUserId, existingUserId].sort()

        const existingChat = $app.findFirstRecordByFilter(
          "chats",
          `space = {:spaceId} && type = "private" && participants.id ?= {:userId1} && participants.id ?= {:userId2}`,
          { spaceId, userId1: sortedParticipants[0], userId2: sortedParticipants[1] }
        )

        // Chat already exists
        skippedCount++
        console.log(`[auto_create_chats] DM chat already exists: space=${spaceId}, users=[${sortedParticipants.join(",")}]`)
      } catch (err) {
        // Chat doesn't exist, create it
        try {
          const dmChat = new Record(chatsCollection)
          dmChat.set("space", spaceId)
          dmChat.set("type", "private")
          // Store participants in sorted order for consistency
          dmChat.set("participants", [newUserId, existingUserId].sort())

          e.app.save(dmChat)
          createdCount++
          console.log(`[auto_create_chats] Created DM chat: space=${spaceId}, users=[${newUserId},${existingUserId}]`)
        } catch (saveErr) {
          // If save fails (e.g., due to race condition), log but continue
          console.warn(`[auto_create_chats] Failed to create DM chat for users [${newUserId},${existingUserId}]:`, saveErr.message)
          // This might be a duplicate created by another concurrent request - verify
          try {
            $app.findFirstRecordByFilter(
              "chats",
              `space = {:spaceId} && type = "private" && participants.id ?= {:userId1} && participants.id ?= {:userId2}`,
              { spaceId, userId1: newUserId, userId2: existingUserId }
            )
            skippedCount++
            console.log(`[auto_create_chats] DM chat created by concurrent request, skipping`)
          } catch {
            console.error(`[auto_create_chats] Failed to create DM chat and it doesn't exist - data inconsistency`)
          }
        }
      }
    })

    console.log(`[auto_create_chats] DM chat creation complete for user ${newUserId} in space ${spaceId}: created=${createdCount}, skipped=${skippedCount}`)

    // Initialize read status for all chats in this space for the new member
    try {
      const allChatsInSpace = $app.findRecordsByFilter(
        "chats",
        `space = {:spaceId}`,
        "",
        0,
        0,
        { spaceId }
      )

      const readStatusCollection = e.app.findCollectionByNameOrId("chat_read_status")
      let readStatusCreated = 0

      arrayOf(allChatsInSpace).forEach((chat) => {
        try {
          // Check if read status already exists
          const existingStatus = $app.findFirstRecordByFilter(
            "chat_read_status",
            `user = {:userId} && chat = {:chatId}`,
            { userId: newUserId, chatId: chat.id }
          )
          // Already exists, skip
        } catch (err) {
          // Doesn't exist, create it
          try {
            const readStatus = new Record(readStatusCollection)
            readStatus.set("user", newUserId)
            readStatus.set("chat", chat.id)
            readStatus.set("last_read_at", new DateTime())
            e.app.save(readStatus)
            readStatusCreated++
          } catch (saveErr) {
            console.warn(`[auto_create_chats] Failed to create read status for user ${newUserId}, chat ${chat.id}:`, saveErr.message)
          }
        }
      })

      console.log(`[auto_create_chats] Initialized read status for user ${newUserId} in space ${spaceId}: created=${readStatusCreated} records`)
    } catch (err) {
      console.error(`[auto_create_chats] Failed to initialize read status for user ${newUserId}:`, err.message)
    }
  } catch (err) {
    console.error(`[auto_create_chats] Unexpected error processing space member ${e.record.id}:`, err.message)
  }

  e.next()
}, "space_members")
