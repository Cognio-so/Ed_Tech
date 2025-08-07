import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import assessmentModel from '@/models/assessmentModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const assessments = await assessmentModel.find({ userId: userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();
    
    // Prepare the assessment data with separated questions and solutions
    const assessmentData = {
      ...body,
      userId: userId,
      createdAt: new Date(),
      questions: body.questions || [],
      solutions: body.solutions || [],
      rawContent: body.rawContent || ''
    };
    
    console.log(`Saving assessment with ${assessmentData.questions.length} questions and ${assessmentData.solutions.length} solutions`);
    
    const assessment = await assessmentModel.create(assessmentData);
    
    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error('Save assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await connectDB();
    await assessmentModel.findOneAndDelete({ _id: id, userId: userId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
} 