#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SHEET_CSV_URL = process.env.SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX7QOSPtqPbW43_n5IGwze9tJ6Vw2eml2tcta7wrqMuIG4Y0IDfRCyotQk98-2S4Ekoz6UTdYFqqO_/pub?output=csv';

const width = 1200;
const height = 700;
const pad = 24;
const innerW = width - pad * 2;
const innerH = height - pad * 2;

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
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
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
function mapRarity(num) {
  const code = Number(num);
  if (code >= 6) return 'legendary';
  if (code === 5) return 'covert';
  if (code === 4) return 'classified';
  if (code === 3) return 'restricted';
  return 'mil_spec';
}
function rarityColors(rarity) {
  switch (rarity) {
    case 'legendary': return { from: '#FFD700', to: '#8A6D1A' };
    case 'covert': return { from: '#E74C3C', to: '#8E2A22' };
    case 'classified': return { from: '#9B59B6', to: '#5E3370' };
    case 'restricted': return { from: '#4C6FFF', to: '#2B3D99' };
    default: return { from: '#B0B0B0', to: '#6E6E6E' };
  }
}
function text(val) { return (val ?? '').toString(); }

async function loadItems() {
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const csv = await res.text();
  const rows = parseCsv(csv);
  const header = rows[0].map(h => normalizeHeader(h));
  const idx = n => header.indexOf(n);
  const aliasIdx = (names) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };

  const iName = idx('name');
  const iWeapon = idx('weapon');
  const iSkin = idx('skin');
  const iRarity = idx('rarity');
  const iWear = idx('wear');
  const iFloat = idx('float');
  const iPattern = idx('pattern_seed');
  const iStatTrak = idx('stattrak');
  const iStickers = idx('stickers');
  const iPrice = aliasIdx(['price','price_usd','price_priceempire_api','price_priceempire']);

  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = row[iName] || '';
    const weapon = row[iWeapon] || '';
    const skin = row[iSkin] || '';
    const wear = (row[iWear] || '').toUpperCase();
    if (!name && !weapon && !skin) continue;
    const rarity = mapRarity(Number(row[iRarity] || '0'));
    const float = Number((row[iFloat] || '0').toString().replace(/[$,\s]/g, '')) || 0;
    const pattern_seed = Number((row[iPattern] || '').toString().replace(/[$,\s]/g, '')) || null;
    const stattrak = ((row[iStatTrak] || '').toString().toLowerCase() === 'yes');
    const stickers = row[iStickers] || '';
    const price = Number((row[iPrice] || '').toString().replace(/[$,\s]/g, '')) || 0;

    const slug = `${weapon.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`+
                 `-${skin.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`+
                 `-${wear.toLowerCase()}`;

    items.push({ slug, name, weapon, skin_family: skin, rarity, condition: wear,
      float, pattern_seed, stattrak, stickers, est_value_cents: Math.round(price * 100) });
  }
  return items;
}

async function loadImageBuffer(candidatePaths) {
  for (const p of candidatePaths) {
    if (!p) continue;
    if (p.startsWith('http')) {
      const res = await fetch(p);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } else {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    }
  }
  return null;
}

function overlaySvg(item, from, to) {
  const price = ((item.est_value_cents || 0) / 100).toFixed(2);
  return Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${to}" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#g)"/>
    <rect x="${pad}" y="${pad}" rx="20" ry="20" width="${innerW}" height="${innerH}" fill="#0b0d0f" stroke="rgba(255,255,255,0.06)"/>
    <rect x="${pad}" y="${pad}" width="${innerW}" height="140" fill="url(#top)" fill-opacity="0"/>
    <defs>
      <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottom" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.68"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="${pad}" y="${height- pad - 220}" width="${innerW}" height="220" fill="url(#bottom)"/>
    <!-- Rarity pill -->
    <g transform="translate(${width - pad - 220}, ${pad + 24})">
      <rect width="200" height="44" rx="22" fill="url(#g)" stroke="rgba(255,255,255,0.25)"/>
      <text x="100" y="30" font-size="22" font-weight="700" text-anchor="middle" fill="#0b0d0f">${text(item.rarity)}</text>
    </g>
    <!-- Name -->
    <text x="${pad + 36}" y="${height - pad - 120}" font-size="42" font-weight="900" fill="#FFFFFF">${text(item.name)}</text>
    <!-- Meta row -->
    <text x="${pad + 36}" y="${height - pad - 80}" font-size="20" fill="#D0D4DA">${text(item.condition)}</text>
    <text x="${pad + 200}" y="${height - pad - 80}" font-size="20" fill="#D0D4DA">float ${(item.float ?? 0).toFixed(4)}</text>
    ${item.pattern_seed ? `<text x="${pad + 380}" y="${height - pad - 80}" font-size="20" fill="#D0D4DA">pattern ${item.pattern_seed}</text>` : ''}
    ${item.stattrak ? `<text x="${pad + 560}" y="${height - pad - 80}" font-size="18" font-weight="700" fill="#F39C12">StatTrak</text>` : ''}
    ${item.stickers ? `<text x="${pad + 36}" y="${height - pad - 48}" font-size="18" fill="#C2C7CF">Stickers: ${text(item.stickers)}</text>` : ''}
    <!-- Value and weapon right side -->
    <text x="${width - pad - 300}" y="${height - pad - 100}" font-size="18" fill="#AEB6C2">Estimated Value</text>
    <text x="${width - pad - 300}" y="${height - pad - 60}" font-size="36" font-weight="900" fill="#FFFFFF">$${price}</text>
    <text x="${width - pad - 300}" y="${height - pad - 28}" font-size="18" fill="#AEB6C2">${text(item.weapon)}</text>
  </svg>
  `);
}

async function composeCard(item) {
  const { from, to } = rarityColors(item.rarity);
  const sourcesDir = path.resolve('apps/web/public/sources');
  const generatedDir = path.resolve('apps/web/public/generated');

  const candidates = [
    path.join(sourcesDir, `${item.slug}.png`),
    path.join(sourcesDir, `${item.slug}.jpg`),
    path.join(generatedDir, `${item.slug}.jpg`),
    item.art_url?.startsWith('http') ? item.art_url : ''
  ];
  const subjectBuf = await loadImageBuffer(candidates);
  if (!subjectBuf) throw new Error(`No subject image for ${item.slug}`);

  // Base gradient background rendered from SVG
  const bg = await sharp({ create: { width, height, channels: 4, background: '#00000000' } }).png().toBuffer();
  const overlay = overlaySvg(item, from, to);
  let base = await sharp(bg)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toBuffer();

  // Subject image resized to fit inner area with padding
  const subject = sharp(subjectBuf).resize({ width: innerW, height: innerH, fit: 'cover' });
  const subjectBufResized = await subject.png().toBuffer();

  // Mask to clip subject within rounded inner rect
  const maskSvg = Buffer.from(`
    <svg width="${innerW}" height="${innerH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" rx="20" ry="20" width="${innerW}" height="${innerH}" fill="#ffffff"/>
    </svg>
  `);
  const subjectMasked = await sharp(subjectBufResized)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Composite subject into inner area
  const final = await sharp(base)
    .composite([
      { input: subjectMasked, left: pad, top: pad },
    ])
    .png()
    .toBuffer();

  return final;
}

async function main() {
  const items = await loadItems();
  const first5 = items.slice(0, 5);
  const outDir = path.resolve('apps/web/public/cards_programmatic');
  fs.mkdirSync(outDir, { recursive: true });

  for (const item of first5) {
    console.log('Composing card ->', item.slug);
    const buf = await composeCard(item);
    fs.writeFileSync(path.join(outDir, `${item.slug}.png`), buf);
  }
  console.log('Done. Files under apps/web/public/cards_programmatic');
}

main().catch((e) => { console.error(e); process.exit(1); });
