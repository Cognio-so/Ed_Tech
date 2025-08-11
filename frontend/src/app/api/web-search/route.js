import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import connectDB from '@/lib/db';
import WebSearch from '@/models/webSearchModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const pythonResult = await pythonApi.runWebSearch({
      topic: body.topic,
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      contentType: body.contentType,
      language: body.language,
      comprehension: body.comprehension,
      maxResults: body.maxResults,
    });

    if (!pythonResult || !pythonResult.content) {
      return NextResponse.json(
        { error: 'Web search failed: Empty content' },
        { status: 500 }
      );
    }

    await connectDB();
    const saved = await WebSearch.create({
      clerkId: userId,
      topic: body.topic,
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      contentType: body.contentType,
      language: body.language || 'English',
      comprehension: body.comprehension || 'intermediate',
      maxResults: body.maxResults || 10,
      query: pythonResult.query,
      searchResults: pythonResult.content,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      query: pythonResult.query,
      content: pythonResult.content,
      saved,
    });
  } catch (error) {
    console.error('Web search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform web search' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const items = await WebSearch.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Web search list API error:', error);
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await connectDB();
    const doc = await WebSearch.findOneAndDelete({ _id: id, clerkId: userId });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web search delete API error:', error);
    return NextResponse.json({ error: 'Failed to delete web search' }, { status: 500 });
  }
}