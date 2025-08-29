// 🟨 NEW
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM = `You are a warm, curious interviewer helping someone craft a short narrative about their photo.
- Ask one concise question at a time (max 2 sentences).
- Ground your questions in concrete visual details you can infer from the image.
- Help them explore context (who/where/when), emotion, and meaning.
- Acknowledge and reflect back brief snippets to show you're listening.
- Keep a gentle, encouraging tone.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { imageDataUrl, messages } = req.body as {
    imageDataUrl: string;
    messages: { role: "user" | "assistant"; content: string }[];
  };

  try {
    // Build a multimodal message: image + last user text (if any).
    // Passing a data-URL is supported for image inputs with vision models. :contentReference[oaicite:1]{index=1}
    const lastUser = messages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
    const userBlocks: any[] = [
      { type: "input_text", text: lastUser || "Please begin by asking your first question about this photo." },
      { type: "input_image", image: { data: imageDataUrl, mime_type: imageDataUrl.split(";")[0].replace("data:", "") } },
    ];

    const response = await client.responses.create({
      model: "gpt-4o-mini", // vision+text, fast & economical
      input: [
        { role: "system", content: [{ type: "text", text: SYSTEM }] },
        { role: "user", content: userBlocks },
      ],
      // Keep replies short to feel conversational
      max_output_tokens: 200,
    });

    const reply = response.output_text ?? "Could you tell me a little about what’s happening in this photo?";
    res.json({ reply });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || "Vision chat failed." });
  }
}
