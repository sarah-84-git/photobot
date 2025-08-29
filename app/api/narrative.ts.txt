// 🟨 NEW
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { imageDataUrl, messages } = req.body as {
    imageDataUrl: string; // not strictly required here, but useful for grounding
    messages: { role: "user" | "assistant"; content: string }[];
  };

  try {
    const transcript = messages
      .map(m => `${m.role === "assistant" ? "Interviewer" : "User"}: ${m.content}`)
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: `From this conversation transcript, write a vivid first-person narrative (150–400 words). 
- Keep factual details consistent; it's okay to artfully infer atmosphere.
- Include setting, characters (if any), emotions, and why this moment matters.
- Keep it warm, human, and concrete.\n\nTranscript:\n${transcript}` },
            { type: "input_image", image: { data: imageDataUrl, mime_type: imageDataUrl.split(";")[0].replace("data:", "") } },
          ],
        },
      ],
      max_output_tokens: 800,
    });

    res.json({ narrative: response.output_text ?? "" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || "Narrative synthesis failed." });
  }
}
