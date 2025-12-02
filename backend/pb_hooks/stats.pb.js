/// <reference path="../pb_data/types.d.ts" />

onBeforeServe((e) => {
  e.router.get("/api/stats", (c) => {
    const user = c.get("authRecord")
    if (!user || user.get("role") !== "Admin") {
      return c.json(403, { error: "Forbidden" })
    }
    const dataDir = $filepath.join($app.dataDir(), "storage")
    let dataSize = 0
    $filepath.walkDir(dataDir, (path, d) => {
      if (!d.isDir()) dataSize += $os.stat(path).size()
    })
    const stat = $os.statfs($app.dataDir())
    return c.json(200, {
      dataSizeMB: Math.round(dataSize / 1024 / 1024 * 10) / 10,
      freeSpaceMB: Math.round(stat.bfree * stat.bsize / 1024 / 1024),
    })
  }).bind($apis.requireAuth())
})
