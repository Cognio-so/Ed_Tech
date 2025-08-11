import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import assessmentModel from '@/models/assessmentModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    console.log('user found', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const assessments = await assessmentModel.find({ clerkId: userId }).sort({ createdAt: -1 });
    
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
    console.log('user found', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();
    
    // Ensure all required fields are present
    const assessmentData = {
      clerkId: userId,
      title: body.title,
      grade: body.grade,
      subject: body.subject,
      description: body.description || '',
      duration: parseInt(body.duration),
      status: body.status || 'draft',
      anxietyTriggers: body.anxietyTriggers || [],
      questions: body.questions || [],
      solutions: body.solutions || [],
      rawContent: body.rawContent || '',
      createdAt: new Date()
    };
    
    console.log(`Saving assessment with ${assessmentData.questions.length} questions and ${assessmentData.solutions.length} solutions`);
    
    const assessment = await assessmentModel.create(assessmentData);
    
    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    console.error('Save assessment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save assessment' },
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
    await assessmentModel.findOneAndDelete({ _id: id, clerkId: userId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
} 