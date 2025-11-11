/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("messages");

  // Update type field to include 'video'
  const typeField = collection.fields.getByName("type");
  typeField.values = ["text", "image", "file", "video"];

  // Update file field to support larger videos (100MB)
  const fileField = collection.fields.getByName("file");
  fileField.maxSize = 104857600; // 100MB

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("messages");

  // Rollback: remove 'video' from type values
  const typeField = collection.fields.getByName("type");
  typeField.values = ["text", "image", "file"];

  // Rollback file size to 50MB
  const fileField = collection.fields.getByName("file");
  fileField.maxSize = 52428800; // 50MB

  app.save(collection);
});
