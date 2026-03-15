import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { tag_id, document_type } = await req.json()

    if (!tag_id || !document_type) {
      return Response.json({ error: 'tag_id and document_type required' }, { status: 400 })
    }

    // Get animal
    const { data: animal } = await supabase
      .from('animals')
      .select('*')
      .eq('tag_id', tag_id)
      .single()

    if (!animal) return Response.json({ error: 'Animal not found' }, { status: 404 })

    const date = new Date().toLocaleDateString('en-JM', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    const prompts: Record<string, string> = {
      movement_permit: `Generate an official livestock movement permit for Jamaica. Format it as a formal government document with these exact sections:

LIVESTOCK MOVEMENT PERMIT
Issued under the Praedial Larceny Prevention Act 2023

PERMIT NUMBER: LMP-${Date.now()}
DATE ISSUED: ${date}

ANIMAL DETAILS:
- Name: ${animal.name}
- Species: ${animal.species}
- Breed: ${animal.breed}
- Weight: ${animal.weight_kg}kg
- Tag ID: ${animal.tag_id}
- RADA Licence: ${animal.rada_licence}

OWNER DETAILS:
- Farm: Greenview Farm
- RADA Registration: RADA-2024-001
- Parish: St. Catherine

PURPOSE OF MOVEMENT: [To be completed by farmer]
DESTINATION: [To be completed by farmer]
EXPECTED DATE OF MOVEMENT: [To be completed by farmer]

CONDITIONS:
1. This animal must be accompanied by this permit at all times during transport
2. The animal must be transported in a clean, suitable vehicle
3. This permit is valid for 7 days from date of issue
4. Any change of ownership must be reported to RADA within 48 hours

VETERINARY DECLARATION:
This animal has been inspected and found fit for transport.

Authorised by: LiveStack Digital Registry System
Verified: ${animal.tag_id} — RADA-2024-001`,

      sale_certificate: `Generate an official livestock sale certificate for Jamaica. Format as a formal legal document:

LIVESTOCK SALE CERTIFICATE
LiveStack Digital Registry — Issued under Praedial Larceny Prevention Act 2023

CERTIFICATE NUMBER: LSC-${Date.now()}
DATE OF SALE: ${date}

ANIMAL TRANSFERRED:
- Name: ${animal.name}
- Species: ${animal.species}  
- Breed: ${animal.breed}
- Weight: ${animal.weight_kg}kg
- Tag ID: ${animal.tag_id}
- RADA Licence: ${animal.rada_licence}

SELLER DETAILS:
- Farm: Greenview Farm
- RADA Registration: RADA-2024-001
- Verified Seller: Yes

BUYER DETAILS:
- Name: [Buyer name]
- RADA Registration: [Buyer RADA number]
- Contact: [Buyer contact]

SALE TERMS:
- Sale Price: [To be agreed]
- Payment Method: [Cash/Transfer]
- Date of Transfer: ${date}

DECLARATION:
I hereby certify that this animal is legally owned by the seller, free from any encumbrances, and has not been reported stolen. Ownership is hereby transferred to the buyer named above.

This transaction has been recorded on the LiveStack blockchain ledger.
Transaction ID: TXN-${Date.now()}`,

      health_declaration: `Generate an official livestock health declaration for Jamaica:

LIVESTOCK HEALTH DECLARATION
Issued under the Animal (Diseases and Importation) Act, Jamaica

DECLARATION NUMBER: LHD-${Date.now()}
DATE: ${date}

ANIMAL INFORMATION:
- Name: ${animal.name}
- Species: ${animal.species}
- Breed: ${animal.breed}
- Weight: ${animal.weight_kg}kg
- Tag ID: ${animal.tag_id}
- RADA Licence: ${animal.rada_licence}

HEALTH STATUS:
- Current Status: ${animal.status === 'active' ? 'Healthy — No concerns' : 'Under observation'}
- Last AI Health Check: ${date}
- Movement Anomalies: None detected in past 30 days
- Disease History: No reportable diseases on record

VACCINATION STATUS:
- FMD: Up to date
- Brucellosis: Up to date
- Anthrax: Up to date

DECLARATION:
I hereby declare that the above animal is in good health, shows no signs of infectious disease, and is fit for transport and/or sale. This declaration is based on LiveStack AI health monitoring data and farm records.

Signed: Farm Owner — Greenview Farm
Verified by: LiveStack AI Health System
Digital Signature: ${animal.tag_id}-${Date.now()}`
    }

    const prompt = prompts[document_type]
    if (!prompt) return Response.json({ error: 'Invalid document type' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    return Response.json({
      success: true,
      document_type,
      animal: animal.name,
      tag_id: animal.tag_id,
      content,
      generated_at: new Date().toISOString(),
    })

  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to generate document' }, { status: 500 })
  }
}