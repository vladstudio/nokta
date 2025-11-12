/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('users');

  collection.fields.addAt(6, new Field({
    name: 'background',
    type: 'text',
    required: false,
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('users');
  collection.fields.removeById(collection.fields.getByName('background').id);
  return app.save(collection);
});
