#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_CSV_URL = process.env.SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX7QOSPtqPbW43_n5IGwze9tJ6Vw2eml2tcta7wrqMuIG4Y0IDfRCyotQk98-2S4Ekoz6UTdYFqqO_/pub?output=csv';
const FAL_KEY = process.env.FAL_KEY;
const FAL_EDIT_ENDPOINT = 'https://fal.run/fal-ai/nano-banana/edit';

const RAW_BASE = process.env.RAW_BASE || 'https://raw.githubusercontent.com/affaan-m/solman/main';
const STYLE_REF = `${RAW_BASE}/apps/web/public/branding/IMG_7826.PNG`;

if (!FAL_KEY) {
  console.error('Missing FAL_KEY env var');
  process.exit(1);
}

function normalizeHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function parseCsv(csv) {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = lines.map(line => {
    const out = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i+1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === ',' && !inQ) {
        out.push(cur); cur = '';
      } else { cur += ch; }
    }
    out.push(cur);
    return out.map(v => v.trim());
  });
  return rows;
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSlug(weapon, skin, wearAbbrev) {
  return [slugify(weapon), slugify(skin), String(wearAbbrev || '').toLowerCase()].filter(Boolean).join('-');
}

function parseRowsToSlugs(rows) {
  if (!rows || rows.length === 0) return [];
  const header = rows[0].map(h => normalizeHeader(h));
  const idx = name => header.indexOf(name);
  const iWeapon = idx('weapon');
  const iSkin = idx('skin');
  const iWear = idx('wear');
  const slugs = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const weapon = row[iWeapon] || '';
    const skin = row[iSkin] || '';
    const wear = (row[iWear] || '').toLowerCase();
    if (!weapon && !skin && !wear) continue;
    slugs.push(buildSlug(weapon, skin, wear));
  }
  return slugs;
}

async function falEdit(prompt, imageUrls) {
  const res = await fetch(FAL_EDIT_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_urls: imageUrls, num_images: 1, output_format: 'jpeg', sync_mode: false })
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(`fal edit failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error('no image url');
  return url;
}

async function main() {
  console.log('Fetching CSV...');
  const csvRes = await fetch(SHEET_CSV_URL);
  if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`);
  const csvText = await csvRes.text();
  const rows = parseCsv(csvText);
  const slugs = parseRowsToSlugs(rows).slice(0,5);

  const outDir = path.resolve(__dirname, '../public/cards_edit');
  fs.mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const subject = `${RAW_BASE}/apps/web/public/generated/${slug}.jpg`;
    console.log('Compositing card via edit ->', slug);
    const prompt = [
      'Replicate the exact 2D card layout, styling, gradients, shadows, and framing of the reference card.',
      'Insert the subject skin image into the card as the central artwork, sized and positioned identically to the reference.',
      'Keep the background, borders, and effects matching the reference style. No extra text or watermarks.',
      'High-resolution, flat 2D look suitable for pack-opening UI.'
    ].join(' ');

    const url = await falEdit(prompt, [STYLE_REF, subject]);
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`download failed: ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${slug}.jpg`), buf);
  }
  console.log('Done. Files saved under apps/web/public/cards_edit');
}

main().catch((e)=>{ console.error(e); process.exit(1); });
