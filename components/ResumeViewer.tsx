// components/ResumeViewer.tsx
"use client";
import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

interface Props {
  resumeText: string;
}

const ResumeViewer: React.FC<Props> = ({ resumeText }) => {
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (resumeRef.current) {
      const opt = {
        margin: 0.5,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().from(resumeRef.current).set(opt).save();
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
      <div ref={resumeRef} className="whitespace-pre-wrap">
        <h2 className="text-xl font-bold mb-4">Generated Resume</h2>
        <pre>{resumeText}</pre>
      </div>
      <button
        onClick={handleDownloadPDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download as PDF
      </button>
    </div>
  );
};

export default ResumeViewer;
