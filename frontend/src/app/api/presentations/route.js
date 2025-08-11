import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Presentation from '@/models/presentationModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    await connectDB();
    const presentations = await Presentation.find({ clerkId: userId }).sort({ createdAt: -1 });
    return NextResponse.json({ presentations });
  } catch (error) {
    console.error('Get presentations error:', error);
    return NextResponse.json({ error: 'Failed to fetch presentations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    const body = await request.json();
    const {
      title,
      topic,
      customInstructions = '',
      slideCount,
      language = 'ENGLISH',
      includeImages = true,
      verbosity = 'standard',
      taskId,
      status = 'SUCCESS',
      presentationUrl = null,
      downloadUrl = null,
      errorMessage = null
    } = body;

    if (!title || !topic || !slideCount || !taskId) {
      return NextResponse.json({ error: 'Missing required fields: title, topic, slideCount, taskId' }, { status: 400 });
    }

    await connectDB();

    // Dedupe by taskId or presentationUrl for this user
    const or = [];
    if (taskId) or.push({ taskId });
    if (presentationUrl) or.push({ presentationUrl });

    let existing = null;
    if (or.length) {
      existing = await Presentation.findOne({ clerkId: userId, $or: or });
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        presentation: {
          id: existing._id,
          title: existing.title,
          topic: existing.topic,
          status: existing.status,
          presentationUrl: existing.presentationUrl,
          downloadUrl: existing.downloadUrl,
          slideCount: existing.slideCount,
          createdAt: existing.createdAt,
          errorMessage: existing.errorMessage
        }
      });
    }

    const presentation = new Presentation({
      clerkId: userId,
      title,
      topic,
      customInstructions,
      slideCount: parseInt(slideCount),
      language,
      includeImages,
      verbosity,
      taskId,
      status,
      presentationUrl,
      downloadUrl,
      apiResponse: null,
      errorMessage
    });

    await presentation.save();

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
  } catch (error) {
    console.error('Save presentation error:', error);
    return NextResponse.json({ error: 'Failed to save presentation' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Presentation ID is required' }, { status: 400 });

    await connectDB();
      const result = await Presentation.findOneAndDelete({ _id: id, clerkId: userId });
    if (!result) {
      return NextResponse.json({ error: 'Presentation not found or you do not have permission to delete it.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Presentation deleted successfully.' });
  } catch (error) {
    console.error('Delete presentation error:', error);
    return NextResponse.json({ error: 'Failed to delete presentation' }, { status: 500 });
  }
} 