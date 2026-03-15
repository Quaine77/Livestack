import { supabase } from '@/lib/supabase'
import { isInsideZone, distanceToBoundary } from '@/lib/geofence'

export async function POST(req: Request) {
  try {
    const { tag_id, lat, lng, activity_score = 100 } = await req.json()

    if (!tag_id || lat === undefined || lng === undefined) {
      return Response.json({ error: 'tag_id, lat, lng required' }, { status: 400 })
    }

    // Get farm boundary
    const { data: boundary } = await supabase
      .from('farm_boundaries')
      .select('coordinates')
      .single()

    if (!boundary) {
      return Response.json({ error: 'No farm boundary found' }, { status: 404 })
    }

    const polygon = boundary.coordinates as Array<{ lat: number; lng: number }>
    const point = { lat, lng }
    const inside = isInsideZone(point, polygon)

    // Get animal
    const { data: animal } = await supabase
      .from('animals')
      .select('id, name, status')
      .eq('tag_id', tag_id)
      .single()

    if (!animal) {
      return Response.json({ error: 'Animal not found' }, { status: 404 })
    }

    // Record the ping
    await supabase.from('tag_pings').insert({
      tag_id,
      animal_id: animal.id,
      lat,
      lng,
      inside_zone: inside,
      activity_score,
    })

    // Update animal position
    await supabase
      .from('animals')
      .update({ lat, lng })
      .eq('tag_id', tag_id)

    // If outside zone and not already blocked — trigger alert
    if (!inside && animal.status === 'active') {
      const dist = distanceToBoundary(point, polygon)

      await supabase.from('animals').update({ status: 'alert' }).eq('id', animal.id)

      await supabase.from('health_alerts').insert({
        animal_id: animal.id,
        alert_type: 'geofence_breach',
        severity: dist > 500 ? 'high' : 'medium',
        message: `${animal.name} has left the farm boundary. Currently ${Math.round(dist)}m from the nearest boundary point. Tag: ${tag_id}`,
        resolved: false,
      })

      return Response.json({
        status: 'ALERT',
        inside: false,
        animal: animal.name,
        message: `Geofence breach — ${Math.round(dist)}m outside boundary`,
      })
    }

    // If back inside — resolve alert
    if (inside && animal.status === 'alert') {
      await supabase.from('animals').update({ status: 'active' }).eq('id', animal.id)
      await supabase
        .from('health_alerts')
        .update({ resolved: true })
        .eq('animal_id', animal.id)
        .eq('alert_type', 'geofence_breach')
        .eq('resolved', false)
    }

    return Response.json({ status: 'OK', inside, animal: animal.name })
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// Simulate a ping (for testing)
export async function GET() {
  return Response.json({
    usage: 'POST /api/ping with { tag_id, lat, lng, activity_score }',
    example: {
      tag_id: 'JM-001',
      lat: 17.9970,
      lng: -76.7936,
      activity_score: 85,
    },
  })
}