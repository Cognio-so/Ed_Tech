import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const query = formData.get('query');
    const sessionId = formData.get('sessionId') || userId; // Use userId as default session ID
    const history = JSON.parse(formData.get('history') || '[]');
    const webSearchEnabled = formData.get('webSearchEnabled') === 'true';
    
    // Get files if any
    const files = formData.getAll('files');
    
    // Send to Python backend
    const result = await pythonApi.sendChatMessage(
      sessionId,
      query,
      files,
      history,
      webSearchEnabled
    );
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 