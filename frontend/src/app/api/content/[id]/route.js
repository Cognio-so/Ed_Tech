import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/contentModel';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const content = await Content.findById(id);
    
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
