// app/api/saved-documents/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DocumentModel from "@/models/document";

export async function GET() {
  await connectDB();
  try {
    const docs = await DocumentModel.find().sort({ createdAt: -1 });
    return NextResponse.json(docs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
