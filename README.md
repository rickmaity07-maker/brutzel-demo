# Brutzel (demo)

Fictional smash-burger takeaway in Cologne. Portfolio demo for restaurant clients: intro animation,
full home page, online ordering (pickup or delivery) and an admin portal. German by default, English switch.

## Run

```bash
npm install
npm run db:setup                    # schema + menu seed (keeps orders)
npm run db:setup -- --reset-orders  # clean slate before recording a demo
npm run dev                         # or: npm run build && npm start
```

`.env.local` (git-ignored) holds `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Neon **test** project
`brutzel-demo`, never production), `ADMIN_PASSWORD`, `ADMIN_SECRET` and `DEMO_MODE=1`.

`DEMO_MODE=1` shows the admin password on the login page and accepts orders outside opening hours.
Turn it off for any real client.

## Demo flow (for the video)

Intro, then scroll the home page, then Speisekarte, then a burger with extras + combo, then Kasse
(Liefern, PLZ 50676), then the live status page. Admin `/admin` (Team-Login in the footer):
Annehmen, Fertig melden, Fahrer losschicken. The customer status page updates by itself.

## How it works

- `src/lib/pricing.ts`: one pricing function used by the cart (display) and the API (truth).
- `src/app/api/orders/route.ts`: zod validation, server re-pricing, per-IP rate limit, single-statement insert.
- Admin: `proxy.ts` guard plus `requireAdmin()` in every page/action; signed httpOnly session cookie;
  login lockout after 8 attempts in 15 minutes (stored in Postgres, not memory).
- Kitchen screen `/admin/kitchen`, menu and prices `/admin/menu`, hours `/admin/hours`, sales `/admin/sales`.
