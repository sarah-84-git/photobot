import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, image } = await req.json();
    if (!prompt || !image) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 });
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image }
          ]
        }
      ]
    });

    const out = (response.output_text ?? "").trim();
    return NextResponse.json({ answer: out || "(No response)" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}