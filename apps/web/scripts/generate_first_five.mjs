#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_CSV_URL = process.env.SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX7QOSPtqPbW43_n5IGwze9tJ6Vw2eml2tcta7wrqMuIG4Y0IDfRCyotQk98-2S4Ekoz6UTdYFqqO_/pub?output=csv';
const FAL_KEY = process.env.FAL_KEY;
const FAL_ENDPOINT = 'https://fal.run/fal-ai/nano-banana';

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

function mapWear(abbrev) {
  switch ((abbrev || '').toUpperCase()) {
    case 'FN': return 'Factory New';
    case 'MW': return 'Minimal Wear';
    case 'FT': return 'Field-Tested';
    case 'WW': return 'Well-Worn';
    case 'BS': return 'Battle-Scarred';
    default: return abbrev || 'Unknown';
  }
}

function mapRarity(num) {
  const code = Number(num);
  if (code >= 6) return 'legendary';
  if (code === 5) return 'covert';
  if (code === 4) return 'classified';
  if (code === 3) return 'restricted';
  return 'mil_spec';
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

function wearAbbrevFromCondition(condition) {
  const c = String(condition || '').toLowerCase();
  if (c.includes('factory new')) return 'FN';
  if (c.includes('minimal wear')) return 'MW';
  if (c.includes('field-tested')) return 'FT';
  if (c.includes('well-worn')) return 'WW';
  if (c.includes('battle-scarred')) return 'BS';
  return condition || '';
}

function normalizeBool(x) {
  const s = String(x || '').toLowerCase();
  return s === 'yes' || s === 'true' || s === '1';
}

function safeNumber(x) {
  const clean = String(x || '').replace(/[$,\s]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
}

function buildSkinPrompt(item) {
  const wearAbbrev = wearAbbrevFromCondition(item.condition);
  const parts = [
    'Ultra-clean studio product render of a Counter-Strike weapon skin.',
    'Single weapon, centered, 3/4 front-left angle, parallel to ground,',
    'matte charcoal background (#0b0d0f), soft key + rim lighting,',
    'subtle ground contact shadow, no text, no watermark, film grain off,',
    'sharp details, photorealistic, high dynamic range, consistent catalog style.',
    '\nSubject details:',
    `Weapon: ${item.weapon}`,
    `Skin: ${item.skin_family}`,
    `Wear: ${item.condition} (${wearAbbrev})`,
    `Float: ${Number(item.float).toFixed(4)}`,
    item.pattern_seed ? `Pattern Seed: ${item.pattern_seed}` : 'Pattern Seed: none',
    item.stattrak ? 'StatTrak: yes' : 'StatTrak: no',
    item.stickers ? `Stickers: ${item.stickers}` : 'Stickers: none',
    '\nFraming: 16:9, subject fills 70% width, ample negative space, no cropping.',
    'Color accuracy and material fidelity prioritized.'
  ];
  return parts.join(' ');
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

function parseRowsToItems(rows) {
  if (!rows || rows.length === 0) return [];
  const header = rows[0].map(h => normalizeHeader(h));
  const idx = name => header.indexOf(name);
  const aliasIdx = names => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };

  const iName = idx('name');
  const iWeapon = idx('weapon');
  const iSkin = idx('skin');
  const iRarity = idx('rarity');
  const iWear = idx('wear');
  const iFloat = idx('float');
  const iPattern = idx('pattern_seed');
  const iStatTrak = idx('stattrak');
  const iStickers = idx('stickers');
  const iRedemption = idx('redemption_date');
  const iAssetId = idx('asset_id');

  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = row[iName] || '';
    const weapon = row[iWeapon] || '';
    const skin = row[iSkin] || '';
    const wearAbbrev = (row[iWear] || '').toUpperCase();
    const rarityNum = Number(row[iRarity] || '0');
    const rarity = mapRarity(rarityNum);
    const condition = mapWear(wearAbbrev);
    const floatVal = safeNumber(row[iFloat]);
    const patternSeed = safeNumber(row[iPattern]);
    const stattrak = normalizeBool(row[iStatTrak]);
    const stickers = row[iStickers] || '';
    const redemption = row[iRedemption] || '';
    const assetId = row[iAssetId] || '';

    if (!name && !weapon && !skin) continue;

    const slug = buildSlug(weapon, skin, wearAbbrev);

    items.push({
      slug,
      name: name || `${weapon} | ${skin} (${condition})`,
      weapon,
      skin_family: skin,
      rarity,
      condition,
      float: Number.isFinite(floatVal) ? floatVal : 0,
      pattern_seed: Number.isFinite(patternSeed) ? patternSeed : null,
      stattrak,
      stickers,
      asset_id: assetId,
      redemption_date: redemption
    });
  }
  return items;
}

async function main() {
  console.log('Fetching CSV...');
  const csvRes = await fetch(SHEET_CSV_URL);
  if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`);
  const csvText = await csvRes.text();
  const rows = parseCsv(csvText);
  const items = parseRowsToItems(rows).slice(0, 5);

  const outDir = path.resolve(__dirname, '../public/generated');
  fs.mkdirSync(outDir, { recursive: true });

  for (const item of items) {
    console.log(`Generating: ${item.slug}`);
    const prompt = buildSkinPrompt(item);
    const res = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, num_images: 1, output_format: 'jpeg', sync_mode: false })
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      throw new Error(`Fal failed (${item.slug}): ${res.status} ${t}`);
    }
    const data = await res.json();
    const url = data?.images?.[0]?.url;
    if (!url) throw new Error(`No image URL for ${item.slug}`);

    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Download failed for ${item.slug}: ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const file = path.join(outDir, `${item.slug}.jpg`);
    fs.writeFileSync(file, buf);
    console.log('Saved ->', file);
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
