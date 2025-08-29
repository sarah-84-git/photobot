// 🟨 NEW — App Router + chat.completions
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM = `You are a warm, curious interviewer helping someone craft a short narrative about their photo.
- Ask one concise question at a time (max 2 sentences).
- Ground your questions in concrete visual details you can infer from the image.
- Help them explore context (who/where/when), emotion, and meaning.
- Acknowledge and reflect back brief snippets to show you're listening.
- Keep a gentle, encouraging tone.`;

export async function POST(req: Request) {
  try {
    const { imageDataUrl, messages } = await req.json();
    const lastUser = (messages as any[])
      .filter(m => m.role === "user")
      .slice(-1)[0]?.content ?? "";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: lastUser || "Please begin by asking your first question about this photo." },
            { type: "image_url", image_url: { url: imageDataUrl } }, // 🟨 pass data URL
          ] as any,
        },
      ],
      max_tokens: 200,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Could you tell me a little about what’s happening in this photo?";
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Vision chat failed." }, { status: 500 });
  }
}
