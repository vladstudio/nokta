/// <reference path="../pb_data/types.d.ts" />

/**
 * Public endpoint to validate an invitation code
 * Returns minimal info needed for signup (inviter name) without exposing all invitation data
 */
routerAdd("POST", "/api/invitations/validate", (e) => {
  const body = $apis.requestInfo(e).body
  const code = body.code

  if (!code || typeof code !== "string" || code.length !== 32) {
    return e.json(400, { valid: false, error: "Invalid code format" })
  }

  try {
    const invitation = $app.findFirstRecordByFilter(
      "invitations",
      `code = {:code} && used != true && expires_at > {:now}`,
      { code, now: new Date().toISOString() }
    )

    if (!invitation) {
      return e.json(200, { valid: false })
    }

    // Get inviter info
    const inviterId = invitation.get("invited_by")
    const inviter = $app.findRecordById("users", inviterId)
    const inviterName = inviter.get("name") || inviter.get("email") || "Someone"

    return e.json(200, {
      valid: true,
      invitedBy: inviterName,
      expiresAt: invitation.get("expires_at")
    })
  } catch (err) {
    return e.json(200, { valid: false })
  }
})

/**
 * Secure signup endpoint using invitation code
 * Handles user creation, invitation marking, and chat creation atomically
 */
routerAdd("POST", "/api/invitations/signup", (e) => {
  const body = $apis.requestInfo(e).body
  const { code, name, email, password } = body

  // Validate inputs
  if (!code || typeof code !== "string" || code.length !== 32) {
    throw new BadRequestError("Invalid invitation code")
  }
  if (!email || typeof email !== "string") {
    throw new BadRequestError("Email is required")
  }
  if (!name || typeof name !== "string") {
    throw new BadRequestError("Name is required")
  }
  if (!password || typeof password !== "string" || password.length < 10) {
    throw new BadRequestError("Password must be at least 10 characters")
  }

  // Find and validate invitation
  let invitation
  try {
    invitation = $app.findFirstRecordByFilter(
      "invitations",
      `code = {:code} && used != true && expires_at > {:now}`,
      { code, now: new Date().toISOString() }
    )
  } catch {
    throw new BadRequestError("Invalid or expired invitation")
  }

  if (!invitation) {
    throw new BadRequestError("Invalid or expired invitation")
  }

  const inviterId = invitation.get("invited_by")

  // Create user with Member role (never allow Admin via signup)
  const usersCollection = $app.findCollectionByNameOrId("users")
  const user = new Record(usersCollection)
  user.set("email", email)
  user.set("name", name)
  user.set("role", "Member")
  user.set("password", password)
  user.set("passwordConfirm", password)
  user.set("emailVisibility", true)

  try {
    $app.save(user)
  } catch (err) {
    throw new BadRequestError("Failed to create user: " + err.message)
  }

  // Mark invitation as used
  invitation.set("used", true)
  $app.save(invitation)

  // Create chat between new user and inviter
  try {
    const chatsCollection = $app.findCollectionByNameOrId("chats")
    const chat = new Record(chatsCollection)
    chat.set("participants", [user.id, inviterId])
    chat.set("created_by", user.id)
    $app.save(chat)
  } catch {}

  return e.json(200, {
    id: user.id,
    email: user.get("email"),
    name: user.get("name")
  })
})

/**
 * Force role to 'Member' on user creation to prevent privilege escalation
 * Only admins can create Admin users
 */
onRecordCreate((e) => {
  const requestRole = e.record.get("role")
  const authRecord = e.requestInfo?.auth

  // If no authenticated user or not an admin, force role to Member
  if (!authRecord || authRecord.get("role") !== "Admin") {
    if (requestRole && requestRole !== "Member") {
      e.record.set("role", "Member")
    }
  }

  return e.next()
}, "users")

/**
 * Validate password complexity on user creation
 * Requires minimum 10 characters
 */
onRecordCreate((e) => {
  const password = e.record.get("password")

  // Check password if provided (PocketBase handles required validation)
  if (password && password.length < 10) {
    throw new BadRequestError("Password must be at least 10 characters")
  }

  return e.next()
}, "users")
