export interface Point { lat: number; lng: number }

// Ray-casting algorithm — checks if a point is inside a polygon
export function isInsideZone(point: Point, polygon: Point[]): boolean {
  let inside = false
  const { lat: px, lng: py } = point
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { lat: xi, lng: yi } = polygon[i]
    const { lat: xj, lng: yj } = polygon[j]
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// Distance between two points in metres
export function distanceMetres(a: Point, b: Point): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

// Nearest boundary point (for alert messages)
export function distanceToBoundary(point: Point, polygon: Point[]): number {
  return Math.min(...polygon.map(p => distanceMetres(point, p)))
}
