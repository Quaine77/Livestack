import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { tag_id, activity_score } = await req.json()

    if (!tag_id || activity_score === undefined) {
      return Response.json({ error: 'tag_id and activity_score required' }, { status: 400 })
    }

    // Get animal
    const { data: animal } = await supabase
      .from('animals')
      .select('*')
      .eq('tag_id', tag_id)
      .single()

    if (!animal) return Response.json({ error: 'Animal not found' }, { status: 404 })

    // Get baseline
    const { data: baseline } = await supabase
      .from('activity_baselines')
      .select('*')
      .eq('tag_id', tag_id)
      .single()

    const avg = baseline?.avg_score ?? 100
    const pct = (activity_score / avg) * 100
    const isAnomaly = pct < 70

    // Update baseline (rolling average)
    const newAvg = baseline
      ? (avg * baseline.readings + activity_score) / (baseline.readings + 1)
      : activity_score

    await supabase
      .from('activity_baselines')
      .upsert({
        animal_id: animal.id,
        tag_id,
        avg_score: Math.round(newAvg * 10) / 10,
        readings: (baseline?.readings ?? 0) + 1,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'tag_id' })

    // If anomaly — call Claude for explanation
    if (isAnomaly) {
      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: 'You are a livestock health assistant. Given sensor data, write a 2 sentence plain-English alert for a Jamaican farmer. Be practical and direct about what to check.',
        messages: [{
          role: 'user',
          content: `Animal: ${animal.name}, ${animal.breed} ${animal.species}, ${animal.weight_kg}kg. Activity today: ${activity_score} vs normal average: ${Math.round(avg)}. That is ${Math.round(pct)}% of normal. What should the farmer know and do?`
        }]
      })

      const message = await stream.finalMessage()
      const explanation = message.content[0].type === 'text' ? message.content[0].text : 'Unusual activity detected. Please check on this animal.'

      // Save alert
      await supabase.from('health_alerts').insert({
        animal_id: animal.id,
        alert_type: 'movement_anomaly',
        severity: pct < 50 ? 'high' : 'medium',
        message: explanation,
        resolved: false,
      })

      // Update animal status
      if (animal.status === 'active') {
        await supabase.from('animals').update({ status: 'alert' }).eq('id', animal.id)
      }

      return Response.json({
        status: 'ALERT',
        animal: animal.name,
        activity_pct: Math.round(pct),
        explanation,
      })
    }

    return Response.json({
      status: 'OK',
      animal: animal.name,
      activity_pct: Math.round(pct),
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}