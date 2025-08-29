// 🟨 NEW — App Router + chat.completions
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { imageDataUrl, messages } = await req.json();

    const transcript = (messages as any[])
      .map((m: any) => `${m.role === "assistant" ? "Interviewer" : "User"}: ${m.content}`)
      .join("\n");

    const prompt = `From this conversation transcript, write a vivid first-person narrative (150–400 words).
- Keep factual details consistent; it's okay to artfully infer atmosphere.
- Include setting, characters (if any), emotions, and why this moment matters.
- Keep it warm, human, and concrete.

Transcript:
${transcript}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } }, // 🟨 include the photo for grounding
          ] as any,
        },
      ],
      max_tokens: 800,
    });

    const narrative = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ narrative });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Narrative synthesis failed." }, { status: 500 });
  }
}
