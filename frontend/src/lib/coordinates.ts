export function parseDms(dms: string): number | null {
  if (!dms) return null
  dms = dms.trim()

  const asFloat = Number(dms)
  if (!isNaN(asFloat)) return asFloat

  const pattern = /^([\d.]+)[°]\s*([\d.]+)['′]\s*([\d.]+)["″]?\s*([NSEWnsew])$/
  const m = dms.match(pattern)
  if (!m) return null

  const deg = parseFloat(m[1])
  const min = parseFloat(m[2])
  const sec = parseFloat(m[3])
  const dir = m[4].toUpperCase()

  let decimal = deg + min / 60 + sec / 3600
  if (dir === "S" || dir === "W") decimal = -decimal

  return decimal
}

export function parseCoordinatePair(input: string): { lat: number; lng: number } | null {
  if (!input) return null
  input = input.trim()

  const parts = input.split(/[,\s]+/)
  if (parts.length === 2) {
    const a = parseDms(parts[0])
    const b = parseDms(parts[1])
    if (a !== null && b !== null) return { lat: a, lng: b }
  }

  const dmsRegex = /([\d.]+[°]\s*[\d.]+['′]\s*[\d.]+[\"″]?\s*[NSEWnsew])/g
  const matches = input.match(dmsRegex)
  if (matches && matches.length >= 2) {
    const lat = parseDms(matches[0])
    const lng = parseDms(matches[1])
    if (lat !== null && lng !== null) return { lat, lng }
  }

  return null
}

export function toaDoDisplay(lat: number | null | undefined, lng: number | null | undefined): string {
  if (lat == null || lng == null) return ""
  return `${lat}, ${lng}`
}
