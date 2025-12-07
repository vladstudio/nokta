/// <reference path="../pb_data/types.d.ts" />

const FCM_SERVICE_URL = "http://127.0.0.1:9090"

const MESSAGE_TYPE_BODY = {
  image: "Sent an image",
  video: "Sent a video",
  voice: "Sent a voice message",
  file: "Sent a file"
}

/**
 * Auto-create read status for chat participants when a chat is created
 */
onRecordAfterCreateSuccess((e) => {
  const chatId = e.record.id
  const participants = e.record.get("participants") || []

  if (!chatId) {
    e.next()
    return
  }

  try {
    const readStatusCollection = e.app.findCollectionByNameOrId("chat_read_status")

    participants.forEach((userId) => {
      try {
        $app.findFirstRecordByFilter(
          "chat_read_status",
          `user = {:userId} && chat = {:chatId}`,
          { userId, chatId }
        )
        // Read status already exists, skip
      } catch {
        // Read status doesn't exist, create it
        try {
          const readStatus = new Record(readStatusCollection)
          readStatus.set("user", userId)
          readStatus.set("chat", chatId)
          readStatus.set("last_read_at", new Date().toISOString())
          e.app.save(readStatus)
        } catch (err) {
          console.log("Failed to create read status for user", userId, "in chat", chatId, ":", err)
        }
      }
    })
  } catch (err) {
    console.log("Failed to initialize read status for chat", chatId, ":", err)
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
    console.log("Failed to update last message for chat", chatId, ":", err)
  }

  e.next()
}, "messages")

/**
 * Send FCM push notification when a message is created
 * Calls the local FCM service (bun run fcm) which handles Google OAuth2
 */
onRecordAfterCreateSuccess((e) => {
  const chatId = e.record.get("chat")
  const senderId = e.record.get("sender")
  const content = e.record.get("content")
  const messageType = e.record.get("type")

  try {
    const chat = e.app.findRecordById("chats", chatId)
    const participants = chat.get("participants") || []

    const senderRecord = e.app.findRecordById("users", senderId)
    const senderName = senderRecord.get("name") || senderRecord.get("email") || "Someone"

    const body = MESSAGE_TYPE_BODY[messageType] || content || ""

    const recipientIds = participants.filter(id => id !== senderId)
    if (recipientIds.length === 0) {
      e.next()
      return
    }

    // Batch query for all recipient device tokens
    const tokens = []
    try {
      const allTokens = e.app.findRecordsByFilter(
        "device_tokens",
        recipientIds.map((_, i) => `user = {:user${i}}`).join(" || "),
        null, 0, 0,
        Object.fromEntries(recipientIds.map((id, i) => [`user${i}`, id]))
      )
      allTokens.forEach(t => tokens.push(t.get("token")))
    } catch (err) {
      console.log("Failed to fetch device tokens:", err)
    }

    if (tokens.length === 0) {
      e.next()
      return
    }

    try {
      const fcmApiKey = $os.getenv("FCM_API_KEY") || ""
      $http.send({
        url: FCM_SERVICE_URL,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${fcmApiKey}`
        },
        body: JSON.stringify({
          tokens: tokens,
          title: senderName,
          body: body,
          data: {
            chatId: chatId,
            senderId: senderId,
            type: "new_message"
          }
        }),
        timeout: 15
      })
    } catch (err) {
      console.log("Failed to send FCM notification:", err)
    }
  } catch (err) {
    console.log("Failed to process message notification for chat", chatId, ":", err)
  }

  e.next()
}, "messages")
