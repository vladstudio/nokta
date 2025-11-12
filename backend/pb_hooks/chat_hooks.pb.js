/// <reference path="../pb_data/types.d.ts" />

/**
 * Auto-create read status for chat participants when a chat is created
 */
onRecordAfterCreateSuccess((e) => {
  const chatId = e.record.id
  const participants = e.record.get("participants") || []

  if (!chatId) {
    console.error("[chat_hooks] Missing chat id")
    e.next()
    return
  }

  try {
    const readStatusCollection = e.app.findCollectionByNameOrId("chat_read_status")
    let createdCount = 0

    participants.forEach((userId) => {
      try {
        // Check if read status already exists
        $app.findFirstRecordByFilter(
          "chat_read_status",
          `user = {:userId} && chat = {:chatId}`,
          { userId, chatId }
        )
        // If we get here, record exists - skip creation
      } catch (err) {
        // Record doesn't exist, create it
        try {
          const readStatus = new Record(readStatusCollection)
          readStatus.set("user", userId)
          readStatus.set("chat", chatId)
          readStatus.set("last_read_at", new Date().toISOString())
          e.app.save(readStatus)
          createdCount++
        } catch (saveErr) {
          console.warn(`[chat_hooks] Failed to create read status for user ${userId}, chat ${chatId}:`, saveErr.message)
        }
      }
    })

    console.log(`[chat_hooks] Created ${createdCount} read status records for chat ${chatId}`)
  } catch (err) {
    console.error(`[chat_hooks] Failed to create read status for chat ${chatId}:`, err.message)
  }

  e.next()
}, "chats")

/**
 * Update chat's last message info when a message is created
 */
onRecordAfterCreateSuccess((e) => {
  const chatId = e.record.get("chat")
  const sender = e.record.get("sender")
  const content = e.record.get("content")

  try {
    const chat = e.app.findRecordById("chats", chatId)
    chat.set("last_message_at", new Date().toISOString())
    chat.set("last_message_content", content)
    chat.set("last_message_sender", sender)
    e.app.save(chat)
  } catch (err) {
    console.error(`[chat_hooks] Failed to update last message for chat ${chatId}:`, err.message)
  }

  e.next()
}, "messages")
