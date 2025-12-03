import { JWT } from "google-auth-library"
import serviceAccount from "./firebase-service-account.json"

const PORT = 9090

// Create JWT client for FCM
const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
})

interface PushRequest {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, string>
}

async function sendPush(req: PushRequest): Promise<{ success: number; failed: number }> {
  const accessToken = await jwtClient.getAccessToken()
  if (!accessToken.token) {
    throw new Error("Failed to get access token")
  }

  let success = 0
  let failed = 0

  for (const token of req.tokens) {
    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.token}`,
          },
          body: JSON.stringify({
            message: {
              token,
              notification: {
                title: req.title,
                body: req.body,
              },
              data: req.data,
              android: {
                priority: "high",
                notification: {
                  channel_id: "messages",
                },
              },
            },
          }),
        }
      )

      if (response.ok) {
        success++
      } else {
        const err = await response.text()
        console.error(`FCM error for token ${token.slice(0, 10)}...:`, err)
        failed++
      }
    } catch (err) {
      console.error(`FCM error for token ${token.slice(0, 10)}...:`, err)
      failed++
    }
  }

  return { success, failed }
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    try {
      const body = (await request.json()) as PushRequest
      const result = await sendPush(body)
      return Response.json(result)
    } catch (err) {
      console.error("Error:", err)
      return new Response(String(err), { status: 500 })
    }
  },
})

console.log(`FCM service running on port ${PORT}`)
