#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const itemsRes = await fetch(`${BASE_URL}/api/items`);
  if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);
  const items = await itemsRes.json();
  const first5 = items.slice(0, 5);

  const outDir = path.resolve(__dirname, '../public/cards');
  fs.mkdirSync(outDir, { recursive: true });

  for (const it of first5) {
    const url = `${BASE_URL}/api/items/card/${encodeURIComponent(it.slug)}`;
    console.log('Rendering card ->', it.slug);
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Card render failed for ${it.slug}: ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${it.slug}.png`), buf);
  }
  console.log('Done. Cards saved under apps/web/public/cards');
}

main().catch((e) => { console.error(e); process.exit(1); });
