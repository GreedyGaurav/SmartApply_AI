// app/api/delete-document/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DocumentModel from "@/models/document";

export async function DELETE(req: Request) {
  await connectDB();

  try {
    const body = await req.text();
    const { id } = JSON.parse(body);

    console.log("DELETE API HIT ✅ ID:", id); // <-- ye zarur dikhna chahiye

    const deleted = await DocumentModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
