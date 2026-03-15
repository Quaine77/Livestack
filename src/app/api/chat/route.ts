import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM = `You are the LiveStack RADA compliance assistant for Jamaican farmers.
You help farmers understand:
- The Praedial Larceny Prevention Act 2023
- RADA animal registration requirements  
- Livestock transport rules and movement permits
- How to use the LiveStack platform
- What to do when an animal is stolen

Be friendly, brief, and practical. Maximum 3 sentences per response.
Always remind farmers that LiveStack generates all required documents automatically.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: SYSTEM,
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Chat unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
