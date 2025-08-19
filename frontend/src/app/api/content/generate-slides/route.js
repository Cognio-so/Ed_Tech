import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Presentation from '@/models/presentationModel';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, title, topic, language, slideCount = 10 } = body;

    if (!content || !title || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: content, title, and topic are required' },
        { status: 400 }
      );
    }

    // Prepare data for the presentation API
    const presentationData = {
      title,
      topic,
      customInstructions: `Generate slides based on this content: ${content.substring(0, 500)}...`,
      slideCount: parseInt(slideCount),
      language: language === 'Arabic' ? 'ARABIC' : 'ENGLISH',
      includeImages: true,
      verbosity: 'standard'
    };

    const pythonResponse = await pythonApi.generatePresentation(presentationData);
    
    if (!pythonResponse || !pythonResponse.presentation) {
      throw new Error('Invalid response from presentation service');
    }

    const result = pythonResponse.presentation;
    
    // Save the presentation to the database
    await connectDB();
    const savedPresentation = await Presentation.create({
      clerkId: userId,
      title,
      topic,
      customInstructions: presentationData.customInstructions,
      slideCount: presentationData.slideCount,
      language: presentationData.language,
      includeImages: presentationData.includeImages,
      verbosity: presentationData.verbosity,
      taskId: result.taskId || 'unknown',
      status: result.status || 'SUCCESS',
      presentationUrl: result.presentationUrl || null,
      downloadUrl: result.downloadUrl || null,
      errorMessage: result.errorMessage || null,
    });

    return NextResponse.json({
      success: true,
      presentation: {
        presentationUrl: result.presentationUrl,
        downloadUrl: result.downloadUrl,
        slideCount: presentationData.slideCount,
        status: result.status || 'SUCCESS',
        errorMessage: result.errorMessage,
        title: title
      },
      saved: savedPresentation
    });
  } catch (error) {
    console.error('Generate slides from content error:', error);
    return NextResponse.json(
      { error: 'Failed to generate slides', details: error.message },
      { status: 500 }
    );
  }
}
