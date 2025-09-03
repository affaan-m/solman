This endpoint refreshes the items cache from Google Sheets.

- Path: /api/cron/refresh-items
- Method: GET
- Auth:
  - If CRON_SECRET is set, pass either:
    - Header: Authorization: Bearer <CRON_SECRET>
    - or Query: ?key=<CRON_SECRET>
  - If CRON_SECRET is not set (not recommended for prod), only Vercel Cron calls are allowed (x-vercel-cron header).

Local test:
```bash
curl -sS "http://localhost:3000/api/cron/refresh-items?key=$CRON_SECRET" | jq
```
