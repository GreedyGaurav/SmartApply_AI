import { NextResponse } from "next/server";
import CoverLetter from "@/models/coverLetter";
import connectDB from "@/lib/db"; // use your actual DB connect utility

export async function POST(req: Request) {
  try {
    await connectDB(); // connect to MongoDB
    const body = await req.json();

    const newCoverLetter = new CoverLetter(body);
    const savedDoc = await newCoverLetter.save();

    return NextResponse.json(savedDoc);
  } catch (err) {
    console.error("Error saving cover letter:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
