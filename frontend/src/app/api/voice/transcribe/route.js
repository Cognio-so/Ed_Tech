import { NextRequest, NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio_file');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const result = await pythonApi.transcribeAudio(audioFile);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        transcription: result.transcription
      });
    } else {
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

