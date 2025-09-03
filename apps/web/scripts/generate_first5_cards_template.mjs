#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_CSV_URL = process.env.SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX7QOSPtqPbW43_n5IGwze9tJ6Vw2eml2tcta7wrqMuIG4Y0IDfRCyotQk98-2S4Ekoz6UTdYFqqO_/pub?output=csv';
const FAL_KEY = process.env.FAL_KEY;
const FAL_EDIT_ENDPOINT = 'https://fal.run/fal-ai/nano-banana/edit';
const STYLE_REF = process.env.STYLE_REF || 'https://raw.githubusercontent.com/affaan-m/solman/main/apps/web/public/branding/IMG_7826.PNG';

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
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.map((line) => {
    const out = [];
    let cur = '';
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
      } else if (ch === ',' && !inQ) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((v) => v.trim());
  });
  return rows;
}
function mapRarity(code) {
  const n = Number(code);
  if (n >= 6) return 'legendary';
  if (n === 5) return 'covert';
  if (n === 4) return 'classified';
  if (n === 3) return 'restricted';
  return 'mil_spec';
}
function rarityGradient(rarity) {
  switch (rarity) {
    case 'legendary': return { from: '#FFD700', to: '#8A6D1A' };
    case 'covert': return { from: '#EF4444', to: '#991B1B' };
    case 'classified': return { from: '#EC4899', to: '#BE185D' };
    case 'restricted': return { from: '#A855F7', to: '#7C3AED' };
    case 'mil_spec': return { from: '#3B82F6', to: '#1D4ED8' };
    default: return { from: '#3B82F6', to: '#1D4ED8' };
  }
}

async function main() {
  console.log('Fetching CSV...');
  const csvRes = await fetch(SHEET_CSV_URL);
  if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`);
  const csvText = await csvRes.text();
  const rows = parseCsv(csvText);

  const header = rows[0].map((h) => normalizeHeader(h));
  const idx = (name) => header.indexOf(name);
  const iName = idx('name');
  const iWeapon = idx('weapon');
  const iSkin = idx('skin');
  const iRarity = idx('rarity');
  const iWear = idx('wear');
  const iFloat = idx('float');
  const iPattern = idx('pattern_seed');
  const iStatTrak = idx('stattrak');
  const iStickers = idx('stickers');
  const iPrice = header.findIndex(h => /price/i.test(h));

  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const name = row[iName] || '';
    const weapon = row[iWeapon] || '';
    const skin = row[iSkin] || '';
    const rarity = mapRarity(row[iRarity] || '');
    const conditionAbbrev = (row[iWear] || '').toUpperCase();
    const floatVal = Number(String(row[iFloat] || '').replace(/[$,\s]/g, '')) || 0;
    const pattern = Number(String(row[iPattern] || '').replace(/[$,\s]/g, '')) || null;
    const stattrak = String(row[iStatTrak] || '').toLowerCase() === 'yes';
    const stickers = row[iStickers] || '';
    const price = Number(String(row[iPrice] || '').replace(/[$,\s]/g, '')) || 0;

    // slug
    const slug = `${weapon.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`+
                 `-${skin.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`+
                 `-${conditionAbbrev.toLowerCase()}`;

    items.push({ slug, name, weapon, rarity, conditionAbbrev, floatVal, pattern, stattrak, stickers, price });
  }

  const first5 = items.slice(0, 5);
  const outDir = path.resolve(__dirname, '../public/cards_template');
  fs.mkdirSync(outDir, { recursive: true });

  for (const it of first5) {
    const grad = rarityGradient(it.rarity);
    const prompt = `Use the single reference image strictly as a template for a flat, 2D trading card. Replace all text with:\n`+
      `- Name: ${it.name}\n`+
      `- Weapon: ${it.weapon}\n`+
      `- Rarity: ${it.rarity}\n`+
      `- Condition: ${it.conditionAbbrev}\n`+
      `- Float: ${it.floatVal.toFixed(4)}\n`+
      `${it.pattern ? `- Pattern: ${it.pattern}` : ''}\n`+
      `${it.stattrak ? `- StatTrak: yes` : `- StatTrak: no`}\n`+
      `${it.stickers ? `- Stickers: ${it.stickers}` : ''}\n`+
      `Keep layout, fonts, spacing, borders, and effects identical to the template. `+
      `Set the card's background gradient to ${grad.from} -> ${grad.to} based on rarity. `+
      `Do not place any weapon or subject image; leave center abstract.`;

    console.log('Template edit ->', it.slug);
    const res = await fetch(FAL_EDIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image_urls: [STYLE_REF], num_images: 1, output_format: 'jpeg', sync_mode: false })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`fal edit failed: ${res.status} ${t}`);
    }
    const data = await res.json();
    const url = data?.images?.[0]?.url;
    if (!url) throw new Error('no image url');

    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`download failed: ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${it.slug}.jpg`), buf);
  }
  console.log('Done. Files saved under apps/web/public/cards_template');
}

main().catch((e)=>{ console.error(e); process.exit(1); });
