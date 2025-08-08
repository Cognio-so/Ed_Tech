import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ImageModel from '@/models/imageModel';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || 'dev-user-123';
    await connectDB();
    const items = await ImageModel.find({ userId: effectiveUserId })
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Images list API error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = auth();
    const effectiveUserId = userId || 'dev-user-123';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await connectDB();
    const doc = await ImageModel.findOneAndDelete({ _id: id, userId: effectiveUserId });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Images delete API error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
