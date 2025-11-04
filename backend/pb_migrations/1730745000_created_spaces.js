/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "spaces",
    type: "base",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
      },
    ],
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("spaces")
  return app.delete(collection)
})
