migrate((app) => {
  const collection = app.findCollectionByNameOrId("messages");
  collection.updateRule = '@request.auth.id != ""';
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("messages");
  collection.updateRule = 'sender = @request.auth.id';
  app.save(collection);
});
