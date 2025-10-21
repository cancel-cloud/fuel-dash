import { Client, Databases, Storage, Query, ID, Permission, Role } from "node-appwrite";
import fetch from "node-fetch";

// ---- helpers ----
function toBase64(buf) {
  return Buffer.isBuffer(buf) ? buf.toString("base64") : Buffer.from(buf).toString("base64");
}
function numNormalize(s) {
  if (!s && s !== 0) return null;
  const t = String(s).replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export default async ({ req, res, log, error }) => {
  try {
    // 1) Parse event payload
    const vars = req?.variables ?? {};
    let rawEvent = vars["APPWRITE_FUNCTION_EVENT_DATA"] || req.body || req.payload || null;
    if (rawEvent && typeof rawEvent === "object") rawEvent = JSON.stringify(rawEvent);
    if (!rawEvent || rawEvent === "{}" || rawEvent === "null") {
      log("No event payload; skipping.");
      return res.json({ skipped: true, reason: "empty payload" });
    }

    let data = {};
    try { data = JSON.parse(rawEvent); } catch { data = {}; }

    const { bucketId, $id: fileId, chunksUploaded = 1, chunksTotal = 1 } = data;
    if (!bucketId || !fileId) {
      log("Missing bucketId or fileId:", data);
      return res.json({ skipped: true });
    }
    if (chunksUploaded !== chunksTotal) {
      log(`Skipping partial upload (${chunksUploaded}/${chunksTotal})`);
      return res.json({ skipped: true });
    }

    // 2) Appwrite client (server context)
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);
    const db = new Databases(client);

    log("🔧 Using database:", process.env.DB_ID);
    log("🔧 Using collection:", process.env.COLLECTION_ID);

    // 3) Download file
    const fileBuffer = await storage.getFileDownload(bucketId, fileId);
    const dataUrl = `data:image/jpeg;base64,${toBase64(fileBuffer)}`;

    // 4) Optimized prompt for German receipts
    const prompt = [
      "You are an expert OCR and data extraction system for German fuel receipts.",
      "Parse the image carefully and return all values in the JSON schema below.",
      "",
      "Rules:",
      "- Always read the fuel type (Diesel, Super, E10, etc.).",
      "- The volume is shown after the word 'Liter' or symbol 'L'.",
      "- The price per liter is shown next to '/L' or '/ Liter'.",
      "- The total price (Summe or Gesamt) is the amount paid, in EUR.",
      "- Dates follow the format DD.MM.YY or DD.MM.YYYY; convert to ISO-8601 (YYYY-MM-DD).",
      "- All numbers must use a dot for decimals, not a comma.",
      "- Never omit a value if it is visible; if not visible, set null.",
      "",
      "Extract the following fields exactly:",
      "- station_name: the name of the fuel station or operator",
      "- date_iso: ISO date of the receipt",
      "- liters: numeric fuel volume in liters",
      "- price_total_eur: total amount in EUR",
      "- price_per_liter_eur: price per liter in EUR",
      "- currency: currency code (usually EUR)"
    ].join("\n");

    // 5) Call OpenAI
    const openaiResp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: dataUrl }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "FuelReceipt",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                station_name: { anyOf: [{ type: "string" }, { type: "null" }] },
                date_iso: { anyOf: [{ type: "string" }, { type: "null" }] },
                liters: { anyOf: [{ type: "number" }, { type: "null" }] },
                price_total_eur: { anyOf: [{ type: "number" }, { type: "null" }] },
                price_per_liter_eur: { anyOf: [{ type: "number" }, { type: "null" }] },
                currency: { anyOf: [{ type: "string" }, { type: "null" }] }
              },
              required: [
                "station_name",
                "date_iso",
                "liters",
                "price_total_eur",
                "price_per_liter_eur",
                "currency"
              ]
            },
            strict: true
          }
        }
      })
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      throw new Error(`OpenAI request failed (${openaiResp.status}): ${errText}`);
    }

    // 6) Parse OpenAI response
    const openaiJson = await openaiResp.json();
    log("🔍 OpenAI raw response (truncated):", JSON.stringify(openaiJson).slice(0, 2000));

    let parsed = null;
    try {
      const outputs = openaiJson.output || [];
      for (const item of outputs) {
        if (item?.content && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === "output_text" && typeof c.text === "string") {
              parsed = JSON.parse(c.text);
              break;
            }
            if (c.type === "output_json" && c.json) {
              parsed = c.json;
              break;
            }
          }
        }
        if (parsed) break;
      }
      if (!parsed && typeof openaiJson.output_text === "string") {
        parsed = JSON.parse(openaiJson.output_text);
      }
    } catch (err) {
      error("❌ JSON parse error:", err);
    }

    if (!parsed) {
      error("❌ Failed to parse structured JSON from OpenAI response.");
      log("🧾 Dump:", JSON.stringify(openaiJson, null, 2).slice(0, 4000));
      throw new Error("Failed to parse structured JSON from OpenAI response.");
    }

    log("✅ Parsed structured JSON:", JSON.stringify(parsed));

    // 7) Normalize + prepare data
    const liters = numNormalize(parsed.liters);
    const priceTotal = numNormalize(parsed.price_total_eur);
    const pricePerLiter =
      numNormalize(parsed.price_per_liter_eur) ??
      (liters && priceTotal ? +(priceTotal / liters).toFixed(3) : null);

    const stationName = parsed.station_name || "Unknown";
    const dateIso = parsed.date_iso || new Date().toISOString();

    // --- Duplicate check ---
    const existing = await db.listDocuments(
      process.env.DB_ID,
      process.env.COLLECTION_ID,
      [
        Query.equal("date", dateIso),
        Query.equal("stationName", stationName),
        Query.equal("priceTotal", priceTotal)
      ]
    );

    if (existing.total > 0) {
      log("⚠️ Duplicate entry detected; skipping save:", {
        date: dateIso,
        stationName,
        priceTotal
      });
      return res.json({
        success: false,
        skipped: true,
        reason: "duplicate",
        existingCount: existing.total
      });
    }

    // 8) Insert document
    await db.createDocument(
      process.env.DB_ID,
      process.env.COLLECTION_ID,
      ID.unique(),
      {
        carId: "audi_a4_2019",
        date: dateIso,
        liters,
        pricePerLiter,
        priceTotal,
        stationName,
        currency: parsed.currency || "EUR",
        receiptFileId: fileId,
        aiParsed: true
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        /* No user needs to delete fuel logs
        Permission.delete(Role.users()),*/
      ]
    );    

    log("✅ Fuel log saved successfully");
    return res.json({
      success: true,
      liters,
      priceTotal,
      pricePerLiter,
      stationName
    });

  } catch (e) {
    error(e);
    return res.json({ success: false, message: String(e?.message || e) });
  }
};
