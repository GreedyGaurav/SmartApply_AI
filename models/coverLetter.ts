import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema(
  {
    fullName: String,
    targetJobRole: String,
    companyName: String,
    experienceSummary: String,
    skills: [String],
    whyGoodFit: String,
    tone: String,
    content: String, // the generated letter
  },
  { timestamps: true }
);

export default mongoose.models.CoverLetter ||
  mongoose.model("CoverLetter", CoverLetterSchema);
