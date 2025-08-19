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
    
    // Debug: Log the entire response structure
    console.log('Full Python response:', JSON.stringify(pythonResponse, null, 2));
    console.log('Result object:', JSON.stringify(result, null, 2));
    
    // Extract the URL from the correct location in the response
    // Based on the terminal output, the URL is in task_info.url
    const presentationUrl = result.task_info?.url || result.task_result?.url || result.url || null;
    
    console.log('Extracted presentation URL:', presentationUrl);
    console.log('task_info?.url:', result.task_info?.url);
    console.log('task_result?.url:', result.task_result?.url);
    console.log('result.url:', result.url);
    
    if (!presentationUrl) {
      console.error('No presentation URL found in response');
      throw new Error('No presentation URL found in response');
    }
    
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
      taskId: result.task_id || result.taskId || 'unknown',
      status: result.task_status || result.status || 'SUCCESS',
      presentationUrl: presentationUrl,
      downloadUrl: presentationUrl, // Use the same URL for download
      errorMessage: result.errorMessage || null,
    });

    return NextResponse.json({
      success: true,
      presentation: {
        presentationUrl: presentationUrl,
        downloadUrl: presentationUrl,
        slideCount: presentationData.slideCount,
        status: result.task_status || result.status || 'SUCCESS',
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
