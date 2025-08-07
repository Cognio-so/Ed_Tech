import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/contentModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = auth();
    
    console.log(`Querying content for userId: ${userId}`);

    await connectDB();
    
    if (!userId) {
      const content = await Content.find({userId: userId}).sort({ createdAt: -1 });
      return NextResponse.json({ content });
    }
    
    const content = await Content.find({ userId }).sort({ createdAt: -1 });
    console.log(`Content fetched for user ${userId}:`, content.length, "items");
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const result = await Content.findOneAndDelete({ _id: id, userId });

    if (!result) {
        return NextResponse.json({ error: 'Content not found or you do not have permission to delete it.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Content deleted successfully." });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}