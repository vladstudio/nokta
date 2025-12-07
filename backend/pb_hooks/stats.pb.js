/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/stats", (e) => {
  if (!e.auth || e.auth.get("role") !== "Admin") {
    return e.json(403, { error: "Forbidden" })
  }

  const dataDir = $app.dataDir()

  // Parse data size from du output
  const duOutput = toString($os.cmd("du", "-sm", dataDir).output())
  const duParts = duOutput.split("\t")
  const dataSizeMB = duParts.length > 0 ? parseInt(duParts[0], 10) || 0 : 0

  // Parse free space from df output
  const dfOutput = toString($os.cmd("df", "-m", dataDir).output())
  const dfLines = dfOutput.split("\n")
  let freeSpaceMB = 0
  if (dfLines.length >= 2) {
    const columns = dfLines[1].split(/\s+/)
    if (columns.length > 3) {
      freeSpaceMB = parseInt(columns[3], 10) || 0
    }
  }

  return e.json(200, { dataSizeMB, freeSpaceMB })
}, $apis.requireAuth())
