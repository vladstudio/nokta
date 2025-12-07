/// <reference path="../pb_data/types.d.ts" />

function parseDataSize(output) {
  const parts = toString(output).split("\t")
  return parts.length > 0 ? parseInt(parts[0], 10) || 0 : 0
}

function parseFreeSpace(output) {
  const lines = toString(output).split("\n")
  if (lines.length < 2) return 0
  const columns = lines[1].split(/\s+/)
  const availableColumnIndex = 3
  return columns.length > availableColumnIndex ? parseInt(columns[availableColumnIndex], 10) || 0 : 0
}

routerAdd("GET", "/api/stats", (e) => {
  if (!e.auth || e.auth.get("role") !== "Admin") {
    return e.json(403, { error: "Forbidden" })
  }

  const dataDir = $app.dataDir()
  const dataSizeMB = parseDataSize($os.cmd("du", "-sm", dataDir).output())
  const freeSpaceMB = parseFreeSpace($os.cmd("df", "-m", dataDir).output())

  return e.json(200, { dataSizeMB, freeSpaceMB })
}, $apis.requireAuth())
