import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import connectDB from '@/lib/db';
import Content from '@/models/contentModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    console.log('Generating content with data for user:', userId);
    
    const body = await request.json();
    
    const result = await pythonApi.generateContent(body);
    
    console.log('Python API result:', result);
    
    if (!result || !result.generated_content || typeof result.generated_content !== 'string' || result.generated_content.trim() === '') {
      console.error('Python backend returned null or empty content:', result);
      return NextResponse.json(
        { error: 'Content generation failed: The AI backend returned empty content. Please check the backend logs for details.' },
        { status: 500 }
      );
    }
    
    await connectDB();
    const savedContent = await Content.create({
      ...body,
      clerkId: userId,
      generatedContent: result.generated_content,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      content: result.generated_content,
      savedContent
    });
  } catch (error) {
    console.error('Content generation API route error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: `Database validation error: ${error.message}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred while generating content.' },
      { status: 500 }
    );
  }
}
