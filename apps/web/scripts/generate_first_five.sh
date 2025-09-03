#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Fetch items and take first 5 slugs
SLUGS=$(curl -sS "$BASE_URL/api/items" | node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
const items = JSON.parse(input);
const slugs = items.slice(0,5).map(x=>x.slug);
console.log(slugs.join("\n"));
')

mkdir -p generated

while IFS= read -r slug; do
  echo "Generating: $slug"
  out=$(curl -sS -X POST "$BASE_URL/api/items/generate-art" -H 'Content-Type: application/json' -d "{\"slug\":\"$slug\"}")
  url=$(echo "$out" | node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
try { const j = JSON.parse(input); console.log(j.url || ""); } catch(e) { console.log(""); }
')
  if [ -z "$url" ]; then
    echo "Failed for $slug: $out" >&2
  else
    fname="generated/${slug}.jpg"
    echo "Downloading -> $fname"
    curl -sSL "$url" -o "$fname"
  fi
  sleep 1
done <<< "$SLUGS"

echo "Done. Files saved under ./apps/web/scripts/generated"