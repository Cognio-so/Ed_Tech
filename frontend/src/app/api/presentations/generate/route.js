import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Presentation from '@/models/presentationModel';
import pythonApi from '@/lib/pythonApi';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = auth();
    
    // Use effectiveUserId like other routes do for development
    const effectiveUserId = userId || 'dev-user-123';
    
    console.log(`Querying presentations for userId: ${effectiveUserId}`);

    await connectDB();
    
    const presentations = await Presentation.find({ userId: effectiveUserId }).sort({ createdAt: -1 });
    console.log(`Presentations fetched for user ${effectiveUserId}:`, presentations.length, "items");
    
    return NextResponse.json({ presentations });
  } catch (error) {
    console.error('Get presentations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presentations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = auth();
    
    // Use effectiveUserId like other routes do for development
    const effectiveUserId = userId || 'dev-user-123';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Presentation ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const result = await Presentation.findOneAndDelete({ _id: id, userId: effectiveUserId });

    if (!result) {
        return NextResponse.json({ error: 'Presentation not found or you do not have permission to delete it.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Presentation deleted successfully." });
  } catch (error) {
    console.error('Delete presentation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete presentation' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = auth();
    
    // Use effectiveUserId like other routes do for development
    const effectiveUserId = userId || 'dev-user-123';

    const body = await request.json();
    const { 
      title,
      topic, 
      customInstructions, 
      slideCount, 
      language, 
      includeImages, 
      verbosity 
    } = body;

    // Validate required fields
    if (!title || !topic || !slideCount) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, topic, and slideCount are required' 
      }, { status: 400 });
    }

    console.log('Generating presentation with data for user:', effectiveUserId, body);

    await connectDB();

    try {
      // Call Python backend to generate presentation
      const presentationData = {
        topic,
        customInstructions: customInstructions || '',
        slideCount: parseInt(slideCount),
        language: language || 'ENGLISH',
        includeImages: includeImages !== false,
        verbosity: verbosity || 'standard'
      };

      const pythonResponse = await pythonApi.generatePresentation(presentationData);
      
      if (!pythonResponse || !pythonResponse.presentation) {
        throw new Error('Invalid response from presentation service');
      }

      const result = pythonResponse.presentation;
      
      // Extract the task result for successful presentations
      const taskResult = result.task_result || {};
      
      // Save presentation to database
      const presentation = new Presentation({
        userId: effectiveUserId,
        title,
        topic,
        customInstructions: customInstructions || '',
        slideCount: parseInt(slideCount),
        language: language || 'ENGLISH',
        includeImages: includeImages !== false,
        verbosity: verbosity || 'standard',
        taskId: result.task_id || 'unknown',
        status: result.task_status || 'SUCCESS',
        presentationUrl: taskResult.url || null,
        downloadUrl: taskResult.download_url || taskResult.url || null,
        apiResponse: result,
        errorMessage: result.task_status === 'FAILURE' ? (taskResult.error || 'Generation failed') : null
      });

      await presentation.save();

      console.log('Presentation saved successfully:', presentation._id);

      return NextResponse.json({
        success: true,
        presentation: {
          id: presentation._id,
          title: presentation.title,
          topic: presentation.topic,
          status: presentation.status,
          presentationUrl: presentation.presentationUrl,
          downloadUrl: presentation.downloadUrl,
          slideCount: presentation.slideCount,
          createdAt: presentation.createdAt,
          errorMessage: presentation.errorMessage
        }
      });

    } catch (pythonError) {
      console.error('Python API error:', pythonError);
      
      // Save failed presentation attempt to database
      const failedPresentation = new Presentation({
        userId: effectiveUserId,
        title,
        topic,
        customInstructions: customInstructions || '',
        slideCount: parseInt(slideCount),
        language: language || 'ENGLISH',
        includeImages: includeImages !== false,
        verbosity: verbosity || 'standard',
        taskId: 'failed',
        status: 'FAILURE',
        errorMessage: pythonError.message || 'Generation failed'
      });

      await failedPresentation.save();

      return NextResponse.json({
        error: 'Failed to generate presentation',
        details: pythonError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Generate presentation error:', error);
    return NextResponse.json(
      { error: 'Failed to process presentation request' },
      { status: 500 }
    );
  }
}
