/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix security vulnerabilities in chats, messages, and typing_events collections
  // Previously these collections allowed ANY authenticated user to see ALL data
  // Now they properly restrict access to participants only

  // Fix chats collection
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = 'participants.id ?= @request.auth.id'
  chats.viewRule = 'participants.id ?= @request.auth.id'
  chats.deleteRule = 'participants.id ?= @request.auth.id'
  app.save(chats)

  // Fix messages collection
  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = 'chat.participants.id ?= @request.auth.id'
  messages.viewRule = 'chat.participants.id ?= @request.auth.id'
  messages.createRule = 'chat.participants.id ?= @request.auth.id'
  messages.updateRule = 'chat.participants.id ?= @request.auth.id'
  app.save(messages)

  // Fix typing_events collection
  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = 'chat.participants.id ?= @request.auth.id'
  typingEvents.viewRule = 'chat.participants.id ?= @request.auth.id'
  typingEvents.createRule = 'chat.participants.id ?= @request.auth.id'
  app.save(typingEvents)

  console.log("[migration] Fixed security rules for chats, messages, and typing_events")
}, (app) => {
  // Rollback: restore the insecure rules
  const chats = app.findCollectionByNameOrId("chats")
  chats.listRule = '@request.auth.id != ""'
  chats.viewRule = '@request.auth.id != ""'
  chats.deleteRule = '@request.auth.id != "" && participants.id ?= @request.auth.id'
  app.save(chats)

  const messages = app.findCollectionByNameOrId("messages")
  messages.listRule = '@request.auth.id != ""'
  messages.viewRule = '@request.auth.id != ""'
  messages.createRule = '@request.auth.id != ""'
  messages.updateRule = '@request.auth.id != ""'
  app.save(messages)

  const typingEvents = app.findCollectionByNameOrId("typing_events")
  typingEvents.listRule = '@request.auth.id != ""'
  typingEvents.viewRule = '@request.auth.id != ""'
  typingEvents.createRule = '@request.auth.id != ""'
  app.save(typingEvents)
})
