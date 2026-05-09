import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageData, apiKey } = await req.json() as { imageData: string; apiKey: string };

    if (!apiKey) {
      return NextResponse.json({ error: 'Mangler API-nøkkel' }, { status: 400 });
    }
    if (!imageData) {
      return NextResponse.json({ error: 'Mangler bilde' }, { status: 400 });
    }

    // Strip base64 prefix if present
    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const mimeMatch = imageData.match(/data:(image\/\w+);base64/);
    const mediaType = (mimeMatch?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Dette er et bilde av en lekseplan eller lekseliste.
Les all tekst og finn alle lekser/fag.
Returner KUN et JSON-array (ingen annen tekst) med objekter som har disse feltene:
- subject: fagnavnet (f.eks. "Matematikk", "Norsk", "Engelsk")
- dueDate: dato i format YYYY-MM-DD (bruk neste hverdag hvis ikke dato er oppgitt, dagens dato er ${new Date().toISOString().split('T')[0]})
- estimatedMinutes: anslått tid i minutter (bruk 30 som standard hvis ukjent)
- description: kort beskrivelse av hva som skal gjøres (maks 60 tegn)

Eksempel på svar:
[{"subject":"Matematikk","dueDate":"2026-04-28","estimatedMinutes":45,"description":"Side 42-44, oppgave 1-10"},{"subject":"Norsk","dueDate":"2026-04-28","estimatedMinutes":20,"description":"Les kapittel 5"}]

Hvis du ikke finner noen lekser i bildet, returner: []`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `API-feil: ${response.status}`, details: err }, { status: 500 });
    }

    const data = await response.json() as { content: { type: string; text: string }[] };
    const text = data.content?.[0]?.text ?? '[]';

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ homeworkItems: parsed });
  } catch (err) {
    return NextResponse.json({ error: 'Noe gikk galt', details: String(err) }, { status: 500 });
  }
}
