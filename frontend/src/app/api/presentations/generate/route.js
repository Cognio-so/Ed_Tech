import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Presentation from '@/models/presentationModel';
import pythonApi from '@/lib/pythonApi';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    console.log(`Querying presentations for userId: ${userId}`);

    await connectDB();
    
    const presentations = await Presentation.find({ clerkId: userId }).sort({ createdAt: -1 });
    console.log(`Presentations fetched for user ${userId}:`, presentations.length, "items");
    
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
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Presentation ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const result = await Presentation.findOneAndDelete({ _id: id, clerkId: userId });

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
    const { userId } = await auth();
    
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

    if (!title || !topic || !slideCount) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, topic, and slideCount are required' 
      }, { status: 400 });
    }

    // Only generate; do NOT save here (autosave removed)
    const presentationData = {
      clerkId: userId,
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
    const taskResult = result.task_result || {};

    return NextResponse.json({
      success: true,
      presentation: {
        // include form/meta so client can save later
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
        errorMessage: result.task_status === 'FAILURE' ? (taskResult.error || 'Generation failed') : null
      }
    });
  } catch (error) {
    console.error('Generate presentation error:', error);
    return NextResponse.json(
      { error: 'Failed to process presentation request', details: error.message },
      { status: 500 }
    );
  }
}
