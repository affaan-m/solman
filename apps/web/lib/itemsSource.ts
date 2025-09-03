/*
  Items source: fetch from Google Sheets (API key, service account, or published CSV),
  transform to our internal schema, and cache in-memory with a short TTL.

  Environment options (choose one of the fetching strategies):
  - SHEET_CSV_URL: direct CSV export URL (best if sheet is published to web)
  - GOOGLE_SHEETS_API_KEY + GOOGLE_SHEETS_SPREADSHEET_ID [+ GOOGLE_SHEETS_RANGE or GOOGLE_SHEETS_GID]
  - GOOGLE_SHEETS_SERVICE_ACCOUNT (JSON) + GOOGLE_SHEETS_SPREADSHEET_ID [+ RANGE or GID]

  Optional:
  - GOOGLE_SHEETS_RANGE: e.g. "Sheet1!A1:N" (header row in first row)
  - GOOGLE_SHEETS_GID: numeric gid (used with gviz CSV if API key not provided)
  - ITEMS_TTL_SECONDS: cache TTL in seconds (default 300)
*/

export type Rarity = "mil_spec" | "restricted" | "classified" | "covert" | "legendary";

export type ItemRecord = {
  slug: string;
  name: string;
  weapon: string;
  skin_family: string;
  rarity: Rarity;
  condition: string;
  float: number;
  est_value_cents: number;
  art_url: string;
  // Optional extras from the sheet
  pattern_seed?: number | null;
  stattrak?: boolean;
  stickers?: string | null;
  asset_id?: string | null;
  redemption_date?: string | null;
};

let cachedItems: ItemRecord[] | null = null;
let cachedAtMs = 0;

function getTtlMs(): number {
  const seconds = Number(process.env.ITEMS_TTL_SECONDS || "300");
  return Math.max(10, seconds) * 1000;
}

export function clearItemsCache() {
  cachedItems = null;
  cachedAtMs = 0;
}

export async function refreshItemsCache(): Promise<ItemRecord[]> {
  const items = await fetchItemsFromConfiguredSource();
  cachedItems = items;
  cachedAtMs = Date.now();
  return items;
}

export async function getItems(): Promise<ItemRecord[]> {
  if (cachedItems && Date.now() - cachedAtMs < getTtlMs()) {
    return cachedItems;
  }
  return await refreshItemsCache();
}

async function fetchItemsFromConfiguredSource(): Promise<ItemRecord[]> {
  // Priority 1: CSV URL
  const csvUrl = process.env.SHEET_CSV_URL;
  if (csvUrl) {
    const text = await simpleFetchText(csvUrl);
    return parseCsvToItems(text);
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    // Fallback to static JSON if not configured
    const staticItems = (await import("@/data/items.json")) as unknown as { default: ItemRecord[] };
    return (staticItems as any).default ?? (staticItems as any);
  }

  // Priority 2: API key based read (public or link-shared sheets)
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (apiKey) {
    const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A1:N";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}?key=${encodeURIComponent(apiKey)}`;
    const json = await simpleFetchJson<{
      range: string;
      values?: string[][];
    }>(url);
    const values = json.values || [];
    return parseRowsToItems(values);
  }

  // Priority 3: Service account (private sheets)
  const svcJson = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT;
  if (svcJson) {
    const { client_email, private_key } = JSON.parse(svcJson);
    const scope = "https://www.googleapis.com/auth/spreadsheets.readonly";
    const jwt = await generateServiceAccountJwt(client_email, private_key, scope);
    const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A1:N";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}`;
    const json = await simpleFetchJson<{ values?: string[][] }>(url, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const values = json.values || [];
    return parseRowsToItems(values);
  }

  // Last resort: gviz CSV (if sheet is public) with gid
  const gid = process.env.GOOGLE_SHEETS_GID || "0";
  const gvizCsv = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/gviz/tq?tqx=out:csv&gid=${encodeURIComponent(gid)}`;
  const text = await simpleFetchText(gvizCsv);
  return parseCsvToItems(text);
}

async function simpleFetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function simpleFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// Minimal JWT for Google service account using RS256
async function generateServiceAccountJwt(
  clientEmail: string,
  privateKey: string,
  scope: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" } as const;
  const claim = {
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  function base64url(input: string | Uint8Array) {
    const buf = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
    return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  const encHeader = base64url(JSON.stringify(header));
  const encClaim = base64url(JSON.stringify(claim));
  const toSign = `${encHeader}.${encClaim}`;

  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(toSign);
  sign.end();
  const signature = sign.sign(privateKey);
  const encSignature = base64url(signature);
  const jwt = `${toSign}.${encSignature}`;

  // Exchange JWT for access token
  const tokenRes = await simpleFetchJson<{ access_token: string }>(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      }) as any
    }
  );

  return tokenRes.access_token;
}

function parseCsvToItems(csv: string): ItemRecord[] {
  const lines = csv.split(/\r?\n/);
  const rows = lines
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const out: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQ = !inQ;
          }
        } else if (ch === "," && !inQ) {
          out.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out.map((v) => v.trim());
    });
  return parseRowsToItems(rows);
}

function parseRowsToItems(rows: string[][]): ItemRecord[] {
  if (!rows || rows.length === 0) return [];
  const header = rows[0].map((h) => normalizeHeader(h));
  const idx = (name: string) => header.indexOf(name);

  const iName = idx("name");
  const iWeapon = idx("weapon");
  const iSkin = idx("skin");
  const iRarity = idx("rarity");
  const iWear = idx("wear");
  const iFloat = idx("float");
  const iPattern = idx("pattern_seed");
  const iStatTrak = idx("stattrak");
  const iStickers = idx("stickers");
  const iRedemption = idx("redemption_date");
  const iAssetId = idx("asset_id");
  const iPrice = idx("price");
  const iImage = idx("image_link") >= 0 ? idx("image_link") : idx("image");

  const items: ItemRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const name = pick(row, iName);
    const weapon = pick(row, iWeapon);
    const skin = pick(row, iSkin);
    const wearAbbrev = pick(row, iWear).toUpperCase();
    const rarityNum = Number(pick(row, iRarity));
    const rarity = mapRarity(rarityNum);
    const condition = mapWear(wearAbbrev);
    const floatVal = safeNumber(pick(row, iFloat));
    const priceUsd = safeNumber(pick(row, iPrice));
    const artUrl = pick(row, iImage);
    const patternSeed = safeNumber(pick(row, iPattern));
    const stattrak = normalizeBool(pick(row, iStatTrak));
    const stickers = pick(row, iStickers) || null;
    const redemption = pick(row, iRedemption) || null;
    const assetId = pick(row, iAssetId) || null;

    if (!name && !weapon && !skin) continue;

    const slug = buildSlug(weapon, skin, wearAbbrev);

    items.push({
      slug,
      name: name || buildName(weapon, skin, condition),
      weapon,
      skin_family: skin,
      rarity,
      condition,
      float: isFinite(floatVal) ? floatVal : 0,
      est_value_cents: isFinite(priceUsd) ? Math.round(priceUsd * 100) : 0,
      art_url: artUrl || defaultArtUrl(weapon, skin, wearAbbrev),
      pattern_seed: isFinite(patternSeed) ? patternSeed : null,
      stattrak: stattrak,
      stickers,
      asset_id: assetId,
      redemption_date: redemption
    });
  }
  return items;
}

function normalizeHeader(h: string): string {
  return (h || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function pick(row: string[], i: number): string {
  if (i < 0 || i >= row.length) return "";
  return String(row[i] ?? "").trim();
}

export function mapRarity(code: number): Rarity {
  // Sheet rarity mapping (2..6 observed): 2=mil_spec, 3=restricted, 4=classified, 5=covert, 6=legendary
  if (code >= 6) return "legendary";
  if (code === 5) return "covert";
  if (code === 4) return "classified";
  if (code === 3) return "restricted";
  return "mil_spec";
}

function mapWear(abbrev: string): string {
  switch (abbrev) {
    case "FN":
      return "Factory New";
    case "MW":
      return "Minimal Wear";
    case "FT":
      return "Field-Tested";
    case "WW":
      return "Well-Worn";
    case "BS":
      return "Battle-Scarred";
    default:
      return abbrev || "Unknown";
  }
}

function buildSlug(weapon: string, skin: string, wearAbbrev: string): string {
  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return [slugify(weapon), slugify(skin), wearAbbrev.toLowerCase()].filter(Boolean).join("-");
}

function buildName(weapon: string, skin: string, condition: string): string {
  if (!weapon && !skin) return condition || "";
  if (!condition) return `${weapon} | ${skin}`;
  return `${weapon} | ${skin} (${condition})`;
}

function defaultArtUrl(weapon: string, skin: string, wearAbbrev: string): string {
  const text = encodeURIComponent(`${weapon} ${skin} ${wearAbbrev}`.trim());
  const bg = {
    FN: "111",
    MW: "222",
    FT: "333",
    WW: "444",
    BS: "555"
  }[wearAbbrev as "FN" | "MW" | "FT" | "WW" | "BS"] || "777";
  return `https://dummyimage.com/320x200/${bg}/fff&text=${text}`;
}

function safeNumber(x: string): number {
  if (!x) return NaN;
  const clean = x.replace(/[$,\s]/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeBool(x: string): boolean {
  const s = (x || "").toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}
