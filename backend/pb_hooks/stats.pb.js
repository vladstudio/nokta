/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/stats", (e) => {
  if (!e.auth || e.auth.get("role") !== "Admin") {
    return e.json(403, { error: "Forbidden" })
  }
  const dataSize = toString($os.cmd("du", "-sm", $app.dataDir()).output()).split("\t")[0]
  const freeSpace = toString($os.cmd("df", "-m", $app.dataDir()).output()).split("\n")[1].split(/\s+/)[3]
  return e.json(200, { dataSizeMB: parseInt(dataSize), freeSpaceMB: parseInt(freeSpace) })
}, $apis.requireAuth())
