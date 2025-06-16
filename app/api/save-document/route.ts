// app/api/save-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import document from "@/models/document";

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();

  try {
    const doc = await document.create(data);
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
