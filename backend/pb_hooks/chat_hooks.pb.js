/// <reference path="../pb_data/types.d.ts" />

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
      } catch {
        try {
          const readStatus = new Record(readStatusCollection)
          readStatus.set("user", userId)
          readStatus.set("chat", chatId)
          readStatus.set("last_read_at", new Date().toISOString())
          e.app.save(readStatus)
        } catch {}
      }
    })
  } catch {}

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
  } catch {}

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
    // Get chat participants
    const chat = e.app.findRecordById("chats", chatId)
    const participants = chat.get("participants") || []

    // Get sender info for notification title
    const senderRecord = e.app.findRecordById("users", senderId)
    const senderName = senderRecord.get("name") || senderRecord.get("email") || "Someone"

    // Build notification body based on message type
    let body = content || ""
    if (messageType === "image") body = "Sent an image"
    else if (messageType === "video") body = "Sent a video"
    else if (messageType === "voice") body = "Sent a voice message"
    else if (messageType === "file") body = "Sent a file"

    // Get FCM tokens for all participants except sender
    const recipientIds = participants.filter(id => id !== senderId)
    if (recipientIds.length === 0) {
      e.next()
      return
    }

    // Find device tokens for recipients
    const tokens = []
    recipientIds.forEach(userId => {
      try {
        const userTokens = e.app.findRecordsByFilter(
          "device_tokens",
          `user = {:userId}`,
          null, 0, 0,
          { userId }
        )
        userTokens.forEach(t => tokens.push(t.get("token")))
      } catch {}
    })

    if (tokens.length === 0) {
      e.next()
      return
    }

    // Send to local FCM service
    try {
      const fcmApiKey = $os.getenv("FCM_API_KEY") || ""
      $http.send({
        url: "http://127.0.0.1:9090",
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
    } catch {}
  } catch {}

  e.next()
}, "messages")
