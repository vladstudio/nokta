/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("calls");

  // Add last_activity field (tracks when call was last active)
  collection.fields.addAt(6, new Field({
    name: "last_activity",
    type: "date",
    required: true
  }));

  app.save(collection);
  return null;
}, (app) => {
  const collection = app.findCollectionByNameOrId("calls");
  const field = collection.fields.getByName("last_activity");
  if (field) {
    collection.fields.removeById(field.id);
  }
  app.save(collection);
  return null;
});
