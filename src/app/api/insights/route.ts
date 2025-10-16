import { NextRequest, NextResponse } from "next/server";

// We call the OpenAI Responses API directly via fetch.
// Docs: platform.openai.com/docs/api-reference/responses
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

export async function POST(req: NextRequest) {
  try {
    const { filters, sample } = await req.json();

    const prompt = [
      "You are an assistant analyzing personal fuel logs. Summarize briefly:",
      "- Any trends in price per liter.",
      "- Which stations appear most.",
      "- The total spend for the selected period and notable spikes.",
      "Be concise (max ~120 words). Output plain text."
    ].join("\n");

    // Create a tiny table summary as text for better grounding
    const compact = (sample ?? []).slice(0, 80).map((l: any) =>
      `${(l.date || l.$createdAt).slice(0,10)} | ${l.stationName ?? "?"} | total=${l.priceTotal ?? "?"} | L=${l.liters ?? "?"} | €/L=${l.pricePerLiter ?? "?"}`
    ).join("\n");

    const body = {
      model: MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: "You write concise, fact-based summaries." }]
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_text", text: "Filters: " + JSON.stringify(filters) },
            { type: "input_text", text: "Data sample:\n" + compact }
          ]
        }
      ],
      // We want plain text back
      response_format: { type: "text" }
    };

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: err }, { status: resp.status });
    }

    const j = await resp.json();
    // Responses API: most commonly the text is in output[0].content[0].text
    const text = j.output?.[0]?.content?.[0]?.text ?? "No content";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
