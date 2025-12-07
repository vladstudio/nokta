/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/daily/rooms", (e) => {
  const key = $os.getenv("DAILY_CO_API_KEY")
  if (!key) throw new BadRequestError("DAILY_CO_API_KEY not configured")

  const info = e.requestInfo()
  const name = info.body.name
  if (!name) throw new BadRequestError("Room name required")

  const res = $http.send({
    url: "https://api.daily.co/v1/rooms",
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
    body: JSON.stringify({
      name: name,
      privacy: "public",
      properties: {
        enable_screenshare: true,
        enable_chat: false,
        enable_knocking: false,
        enable_prejoin_ui: false,
        max_participants: 50
      }
    }),
    timeout: 30
  })
  if (res.statusCode >= 400) throw new BadRequestError("Daily.co: " + res.raw)
  return e.json(200, res.json)
})

routerAdd("DELETE", "/api/daily/rooms/{name}", (e) => {
  const key = $os.getenv("DAILY_CO_API_KEY")
  if (!key) throw new BadRequestError("DAILY_CO_API_KEY not configured")

  const name = e.request.pathValue("name")
  $http.send({
    url: "https://api.daily.co/v1/rooms/" + name,
    method: "DELETE",
    headers: { "Authorization": "Bearer " + key },
    timeout: 30
  })
  return e.json(200, { deleted: true })
})

routerAdd("POST", "/api/daily/leave", (e) => {
  const key = $os.getenv("DAILY_CO_API_KEY")
  if (!key) throw new BadRequestError("DAILY_CO_API_KEY not configured")

  const info = e.requestInfo()
  const chatId = info.body.chatId
  const userId = info.body.userId
  if (!chatId || !userId) throw new BadRequestError("chatId and userId required")

  const chat = $app.findRecordById("chats", chatId)
  if (!chat) return e.json(200, { ok: true })

  const participants = chat.get("call_participants") || []
  const updated = participants.filter(id => id !== userId)
  const isLast = updated.length === 0

  if (isLast) {
    const roomUrl = chat.get("daily_room_url")
    if (roomUrl && typeof roomUrl === "string") {
      const parts = roomUrl.split("/")
      const roomName = parts.length > 0 ? parts.pop() : null
      if (roomName) {
        try {
          $http.send({
            url: "https://api.daily.co/v1/rooms/" + roomName,
            method: "DELETE",
            headers: { "Authorization": "Bearer " + key },
            timeout: 30
          })
        } catch (err) {
          console.log("Failed to delete Daily room:", err)
        }
      }
    }
  }

  chat.set("call_participants", updated)
  chat.set("is_active_call", !isLast)
  if (isLast) chat.set("daily_room_url", "")
  $app.save(chat)

  return e.json(200, { ok: true })
})
