import { NextRequest, NextResponse } from 'next/server';

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;
const VOICE_ID = 'de3dcaaa-317e-47e4-9302-777a1a6946f4';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!CARTESIA_API_KEY) {
      return NextResponse.json({ error: 'Cartesia API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CARTESIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Cartesia-Version': '2025-04-16',
      },
      body: JSON.stringify({
        model_id: 'sonic-3',
        transcript: text,
        voice: {
          mode: 'id',
          id: VOICE_ID,
        },
        language: 'ko',
        output_format: {
          container: 'mp3',
          sample_rate: 44100,
          bit_rate: 128000,
        },
        generation_config: {
          speed: 0.85,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cartesia API error:', errorText);
      return NextResponse.json(
        { error: 'TTS generation failed', details: errorText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
