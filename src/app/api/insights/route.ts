// ./src/app/api/insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { FuelLog } from "@/lib/types";

type Granularity = "month" | "year";
type Filters = { carId: string | null; granularity: Granularity; year: number | "all" };
type InsightBody = { filters: Filters; sample: FuelLog[] };

// Minimal structural types for Responses API payload
type ResponsesContentItem = { type: string; text?: string };
type ResponsesOutputItem = { content?: ResponsesContentItem[] };
type ResponsesAPIResponse = { output?: ResponsesOutputItem[] };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

export async function POST(req: NextRequest) {
  try {
    const parsedBody = (await req.json()) as unknown;

    // Narrow request body
    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      !("filters" in parsedBody) ||
      !("sample" in parsedBody)
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { filters, sample } = parsedBody as InsightBody;

    const prompt = [
      "You are an assistant analyzing personal fuel logs. Summarize briefly:",
      "- Trends in price per liter.",
      "- Most frequent stations.",
      "- Total spend for the selected period and notable spikes.",
      "Be concise (max ~120 words). Output plain text.",
    ].join("\n");

    const compact = (sample ?? [])
      .slice(0, 80)
      .map((l: FuelLog) =>
        `${(l.date || l.$createdAt).slice(0, 10)} | ${l.stationName ?? "?"} | total=${l.priceTotal ?? "?"} | L=${l.liters ?? "?"} | €/L=${l.pricePerLiter ?? "?"}`
      )
      .join("\n");

    const body = {
      model: MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: "You write concise, fact-based summaries." }],
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_text", text: "Filters: " + JSON.stringify(filters) },
            { type: "input_text", text: "Data sample:\n" + compact },
          ],
        },
      ],
      response_format: { type: "text" },
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
      const errText = await resp.text();
      return NextResponse.json({ error: errText }, { status: resp.status });
    }

    // ---- Safe narrowing of unknown JSON (no 'any') ----
    const jsonPayload: unknown = await resp.json();

    let text = "No content";
    if (typeof jsonPayload === "object" && jsonPayload !== null) {
      const outField = (jsonPayload as { output?: unknown }).output;
      if (Array.isArray(outField) && outField.length > 0) {
        const first = outField[0];
        if (typeof first === "object" && first !== null) {
          const contentField = (first as { content?: unknown }).content;
          if (Array.isArray(contentField) && contentField.length > 0) {
            const c0 = contentField[0];
            if (typeof c0 === "object" && c0 !== null) {
              const maybeText = (c0 as { text?: unknown }).text;
              if (typeof maybeText === "string") {
                text = maybeText;
              }
            }
          }
        }
      }
    }
    // ---------------------------------------------------

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
