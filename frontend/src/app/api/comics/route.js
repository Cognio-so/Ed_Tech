import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comic from "@/models/comicModel";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    await connectDB();
    const items = await Comic.find({ clerkId: userId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Comics list API error:", error);
    return NextResponse.json({ error: "Failed to fetch comics" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    const body = await request.json();

    const { instructions, gradeLevel, numPanels, panels = [], images = [] } = body || {};
    if (!instructions || !gradeLevel || !numPanels || (!panels.length && !images.length)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const saved = await Comic.create({
      clerkId: userId,
      instructions,
      gradeLevel,
      numPanels,
      panels: panels.length
        ? panels.map((p, idx) => ({
            index: p.index ?? idx + 1,
            prompt: p.prompt || "",
            imageUrl: p.imageUrl,
          }))
        : images.map((url, idx) => ({ index: idx + 1, prompt: "", imageUrl: url })),
      images: panels.length ? panels.map((p) => p.imageUrl) : images,
      status: "success",
    });

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.error("Comics save API error:", error);
    return NextResponse.json({ error: "Failed to save comic" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await connectDB();
    const doc = await Comic.findOneAndDelete({ _id: id, clerkId: userId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comics delete API error:", error);
    return NextResponse.json({ error: "Failed to delete comic" }, { status: 500 });
  }
}
