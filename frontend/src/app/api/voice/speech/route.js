import { NextRequest, NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';

export async function POST(request) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const result = await pythonApi.generateSpeech(text, voice);
    
    if (result.success && result.audio_data) {
      const audioBytes = Buffer.from(result.audio_data, 'hex');
      return new NextResponse(audioBytes, {
        headers: {
          'Content-Type': 'audio/mp3',
          'Content-Length': audioBytes.length.toString(),
        },
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Speech generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

```

```

