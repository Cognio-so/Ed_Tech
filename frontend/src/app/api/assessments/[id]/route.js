import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Assessment from '@/models/assessmentModel';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const assessment = await Assessment.findById(id);
    
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Get assessment by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
