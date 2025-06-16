import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      jobTitle,
      experience,
      education,
      skills,
      certifications,
      role,
      style,
    } = body;

    const prompt = `
      Create a ${style} resume for ${name} applying as a ${role}.

      Job Title: ${jobTitle}
      Experience: ${experience}
      Education: ${education}
      Skills: ${skills.join(", ")}
      Certifications: ${certifications}
    `;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // replace with your actual domain in prod
          "X-Title": "Smart Resume Generator",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // or try 'google/gemma-7b-it' (faster)
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
    console.error("Error generating resume:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
