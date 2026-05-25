import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { description, openaiKey } = await req.json() as { description: string; openaiKey: string };

  if (!openaiKey?.startsWith('sk-')) {
    return NextResponse.json({ error: 'Ugyldig OpenAI API-nøkkel. Den skal starte med sk-' }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: 'Beskrivelse mangler' }, { status: 400 });
  }

  const prompt = `A cute, colorful cartoon avatar illustration for a child. ${description}. Style: bright vibrant colors, friendly cartoon character, round face, large expressive eyes, white background, centered portrait, high quality digital illustration, suitable for children, no text, no words, no letters.`;

  const genRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  });

  const genData = await genRes.json() as { data?: { url: string }[]; error?: { message: string } };

  if (!genRes.ok || !genData.data?.[0]?.url) {
    return NextResponse.json({ error: genData.error?.message ?? 'Feil ved billegenerering. Sjekk API-nøkkelen.' }, { status: 400 });
  }

  // Download the image server-side (DALL-E URLs are CORS-restricted from browser)
  // and convert to base64 so it's stored permanently (URLs expire after 1 hour)
  const imgRes = await fetch(genData.data[0].url);
  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  return NextResponse.json({ imageData: dataUrl });
}
