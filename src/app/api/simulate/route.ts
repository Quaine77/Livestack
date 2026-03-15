import { supabase } from '@/lib/supabase'

const ANIMALS = [
  { tag_id: 'JM-001', lat: 17.9970, lng: -76.7936 },
  { tag_id: 'JM-002', lat: 17.9985, lng: -76.7920 },
  { tag_id: 'JM-003', lat: 17.9960, lng: -76.7950 },
  { tag_id: 'JM-004', lat: 17.9975, lng: -76.7910 },
  { tag_id: 'JM-006', lat: 17.9990, lng: -76.7900 },
  { tag_id: 'JM-007', lat: 17.9945, lng: -76.7940 },
  { tag_id: 'JM-008', lat: 17.9980, lng: -76.7925 },
]

function randomWalk(lat: number, lng: number, escaped = false) {
  const step = escaped ? 0.003 : 0.0008
  return {
    lat: lat + (Math.random() - 0.5) * step,
    lng: lng + (Math.random() - 0.5) * step,
  }
}

export async function POST(req: Request) {
  const { escape_tag_id } = await req.json().catch(() => ({}))

  const results = []

  for (const animal of ANIMALS) {
    const escaped = animal.tag_id === escape_tag_id
    const { lat, lng } = randomWalk(animal.lat, animal.lng, escaped)

    // Update position in animals table directly
    const { data } = await supabase
      .from('animals')
      .update({ lat, lng })
      .eq('tag_id', animal.tag_id)
      .select('id, name')
      .single()

    // Also ping the geofence API
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_id: animal.tag_id,
          lat,
          lng,
          activity_score: Math.round(70 + Math.random() * 30),
        }),
      })
    } catch {}

    results.push({ tag_id: animal.tag_id, lat, lng, escaped })

    // Update local state for next call
    animal.lat = lat
    animal.lng = lng
  }

  return Response.json({ simulated: results.length, results })
}