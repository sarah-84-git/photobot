// 🟨 NEW — App Router route handler (no "handler" export)
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // 🟨 NEW (safer for SDK + env)

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM = `You are a warm, curious interviewer helping someone craft a short narrative about their photo.
- Ask one concise question at a time (max 2 sentences).
- Ground your questions in concrete visual details you can infer from the image.
- Help them explore context (who/where/when), emotion, and meaning.
- Acknowledge and reflect back brief snippets to show you're listening.
- Keep a gentle, encouraging tone.`;

export async function POST(req: Request) {
  try {
    const { imageDataUrl, messages } = (await req.json()) as {
      imageDataUrl: string;
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const lastUser = messages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
    const userBlocks: any[] = [
      { type: "input_text", text: lastUser || "Please begin by asking your first question about this photo." },
      {
        type: "input_image",
        image: {
          data: imageDataUrl,
          mime_type: imageDataUrl.split(";")[0].replace("data:", ""),
        },
      },
    ];

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: [{ type: "text", text: SYSTEM }] },
        { role: "user", content: userBlocks },
      ],
      max_output_tokens: 200,
    });

    const reply =
      (response as any).output_text ??
      "Could you tell me a little about what’s happening in this photo?";
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Vision chat failed." }, { status: 500 });
  }
}
