import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, image } = await req.json();
    if (!prompt || !image) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 });
    }

    // ✅ Use Chat Completions with vision
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: image } } // data URL is fine
          ]
        }
      ],
    });

    const out =
      completion.choices?.[0]?.message?.content?.toString().trim() ?? "";

    return NextResponse.json({ answer: out || "(No response)" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
