// models/document.ts
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    company: String,
    jobRole: String,
    style: String,
    content: String,
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model("Document", DocumentSchema);
