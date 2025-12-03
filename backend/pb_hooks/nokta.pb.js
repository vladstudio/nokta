/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/nokta", (e) => {
  return e.json(200, { app: "nokta", version: "1.0.0" })
})
