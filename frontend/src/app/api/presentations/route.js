import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Presentation from '@/models/presentationModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = auth();
    
    // Use effectiveUserId like other routes do for development
    const effectiveUserId = userId || 'dev-user-123';
    
    console.log(`Querying presentations for userId: ${effectiveUserId}`);

    await connectDB();
    
    const presentations = await Presentation.find({ userId: effectiveUserId }).sort({ createdAt: -1 });
    console.log(`Presentations fetched for user ${effectiveUserId}:`, presentations.length, "items");
    
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
    const { userId } = auth();
    
    // Use effectiveUserId like other routes do for development
    const effectiveUserId = userId || 'dev-user-123';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Presentation ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const result = await Presentation.findOneAndDelete({ _id: id, userId: effectiveUserId });

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