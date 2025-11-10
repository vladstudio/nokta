migrate((app) => {
  const collection = app.findCollectionByNameOrId("messages");
  collection.fields.addAt(6, new Field({name: "reactions", type: "json", required: false}));
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("messages");
  collection.fields.removeById(collection.fields.getByName("reactions").id);
  app.save(collection);
});
