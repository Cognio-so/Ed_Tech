import { NextRequest, NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';

export async function POST(request) {
  try {
    const { text, webSearchEnabled } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const response = await pythonApi.startVoiceChatStream({
      text,
      webSearchEnabled
    });

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice chat' },
      { status: 500 }
    );
  }
}
