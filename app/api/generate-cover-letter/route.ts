import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      targetJobRole,
      companyName,
      experienceSummary,
      skills,
      whyGoodFit,
      tone,
    } = body;

    const prompt = `
Write a ${tone} cover letter for ${fullName} applying to the role of ${targetJobRole} at ${companyName}.

Experience Summary:
${experienceSummary}

Skills:
${skills.join(", ")}

Why ${fullName} is a good fit:
${whyGoodFit}

Make it tailored, concise, and compelling.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // update in prod
          "X-Title": "Smart Cover Letter Generator",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices) {
      console.error("Invalid OpenRouter response:", data);
      return NextResponse.json({ error: "Invalid response" }, { status: 500 });
    }

    return NextResponse.json({ result: data.choices[0].message.content });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
