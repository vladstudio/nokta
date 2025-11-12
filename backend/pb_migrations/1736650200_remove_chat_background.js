/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('chats');
  const backgroundField = collection.fields.getByName('background');

  if (backgroundField) {
    collection.fields.removeById(backgroundField.id);
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('chats');

  collection.fields.addAt(7, new Field({
    name: 'background',
    type: 'text',
    required: false,
  }));

  return app.save(collection);
});
