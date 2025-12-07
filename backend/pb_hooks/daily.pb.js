/// <reference path="../pb_data/types.d.ts" />

const DAILY_API_URL = "https://api.daily.co/v1/rooms"

const ROOM_PROPERTIES = {
  enable_screenshare: true,
  enable_chat: false,
  enable_knocking: false,
  enable_prejoin_ui: false,
  max_participants: 50
}

function getDailyApiKey() {
  const key = $os.getenv("DAILY_CO_API_KEY")
  if (!key) throw new BadRequestError("DAILY_CO_API_KEY not configured")
  return key
}

function extractRoomName(roomUrl) {
  if (!roomUrl || typeof roomUrl !== "string") return null
  const parts = roomUrl.split("/")
  return parts.length > 0 ? parts.pop() : null
}

routerAdd("POST", "/api/daily/rooms", (e) => {
  const key = getDailyApiKey()
  const info = e.requestInfo()
  const name = info.body.name
  if (!name) throw new BadRequestError("Room name required")

  const res = $http.send({
    url: DAILY_API_URL,
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
    body: JSON.stringify({ name: name, privacy: "public", properties: ROOM_PROPERTIES }),
    timeout: 30
  })
  if (res.statusCode >= 400) throw new BadRequestError("Daily.co: " + res.raw)
  return e.json(200, res.json)
})

routerAdd("DELETE", "/api/daily/rooms/{name}", (e) => {
  const key = getDailyApiKey()
  const name = e.request.pathValue("name")
  $http.send({
    url: DAILY_API_URL + "/" + name,
    method: "DELETE",
    headers: { "Authorization": "Bearer " + key },
    timeout: 30
  })
  return e.json(200, { deleted: true })
})

// Handle leave call on browser close (via sendBeacon)
routerAdd("POST", "/api/daily/leave", (e) => {
  const key = getDailyApiKey()

  const info = e.requestInfo()
  const chatId = info.body.chatId
  const userId = info.body.userId
  if (!chatId || !userId) throw new BadRequestError("chatId and userId required")

  const chat = $app.findRecordById("chats", chatId)
  if (!chat) return e.json(200, { ok: true }) // Chat already deleted

  const participants = chat.get("call_participants") || []
  const updated = participants.filter(id => id !== userId)
  const isLast = updated.length === 0

  // Delete Daily room if last participant
  if (isLast) {
    const roomName = extractRoomName(chat.get("daily_room_url"))
    if (roomName) {
      try {
        $http.send({
          url: DAILY_API_URL + "/" + roomName,
          method: "DELETE",
          headers: { "Authorization": "Bearer " + key },
          timeout: 30
        })
      } catch (err) {
        console.log("Failed to delete Daily room:", err)
      }
    }
  }

  // Update chat record
  chat.set("call_participants", updated)
  chat.set("is_active_call", !isLast)
  if (isLast) chat.set("daily_room_url", "")
  $app.save(chat)

  return e.json(200, { ok: true })
})
