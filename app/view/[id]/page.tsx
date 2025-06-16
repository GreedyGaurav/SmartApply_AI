// ✅ Force dynamic behavior for server component
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import DocumentModel from "@/models/document";

interface DocumentType {
  _id: string;
  title: string;
  type: string;
  company?: string;
  jobRole?: string;
  style?: string;
  content?: string;
  createdAt?: Date;
}

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const id = params.id;

  const doc = (await DocumentModel.findById(id).lean()) as DocumentType | null;

  if (!doc) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
      <p>
        <strong>Type:</strong> {doc.type}
      </p>
      <p>
        <strong>Company:</strong> {doc.company || "N/A"}
      </p>
      <p>
        <strong>Role:</strong> {doc.jobRole || "N/A"}
      </p>
      <p>
        <strong>Style:</strong> {doc.style || "Default"}
      </p>

      <div className="mt-6 border-t pt-4 prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: doc.content || "" }} />
      </div>
    </div>
  );
}
