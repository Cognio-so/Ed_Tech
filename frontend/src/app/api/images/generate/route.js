import { NextResponse } from 'next/server';
import pythonApi from '@/lib/pythonApi';
import connectDB from '@/lib/db';
import ImageModel from '@/models/imageModel';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();

    const body = await request.json();

    // Map incoming body to python payload (the UI sends those fields already)
    const pythonResult = await pythonApi.generateImage({
      topic: body.topic,
      gradeLevel: body.gradeLevel,
      visualType: body.visualType,
      subject: body.subject,
      difficultyFlag: !!body.difficultyFlag,
      instructions: body.instructions,
    });

    if (!pythonResult || !pythonResult.image_url) {
      return NextResponse.json(
        { error: 'Image generation failed: No URL returned' },
        { status: 500 }
      );
    }

    await connectDB();
    const saved = await ImageModel.create({
      clerkId: userId,
      topic: body.topic,
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      visualType: body.visualType,
      instructions: body.instructions,
      difficultyFlag: (body.difficultyFlag ? 'true' : 'false'),
      imageUrl: pythonResult.image_url,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      imageUrl: pythonResult.image_url,
      saved,
    });
  } catch (error) {
    console.error('Image generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
