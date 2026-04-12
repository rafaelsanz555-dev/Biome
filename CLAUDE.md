# bio.me — CLAUDE.md
## "The platform where storytellers become millionaires."

---

## VISION & NORTH STAR

bio.me is the first platform on the planet built exclusively for storytellers to build an audience, monetize their life narrative, and achieve financial freedom through the power of human connection.

**The insight:** The best storytellers are the most powerful salespeople on earth. Someone who can tell a compelling story sells more than any marketer. bio.me gives them the infrastructure to monetize that gift.

**The model:** Writers pay $5/month to publish. Readers subscribe to individual writers. Rafael earns 10-12% of everything writers generate + the $5/month flat fee per writer. Readers pay writers directly — Rafael earns from volume.

---

## FOUNDER

**Rafael Bernardo Sanz Espinoza** — building bio.me as part of a SaaS portfolio alongside Cliente Loop (agentic CRM). Fast decision-maker, execution-focused, target: financial independence through SaaS.

---

## PORTS — NEVER CHANGE WITHOUT ASKING

| Service | Port | Command |
|---------|------|---------|
| **bio.me** | **8000** | `next dev -p 8000` |
| Cliente Loop Frontend | 4000 | DO NOT USE |
| Cliente Loop Backend | 3001 | DO NOT USE |

**Rule:** Always run bio.me with `next dev -p 8000`. Never use 3000, 3001, or 4000 — those belong to Cliente Loop.

---

## CURRENT PROJECT STATE

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase + Stripe

**Already built:**
- Supabase connected (`NEXT_PUBLIC_SUPABASE_URL` configured in `.env.local`)
- Auth routes: `/app/(auth)/`
- Writer profiles: `/app/[username]/`
- API routes: `/app/api/`
- Dashboard: `/app/dashboard/`
- Discovery feed: `/app/discover/`
- DB schema: `schema.sql` + `supabase_setup.sql`
- Components library: `components.json` (shadcn/ui)

**Pending (Stripe):**
- `STRIPE_SECRET_KEY` — not yet configured
- `STRIPE_WEBHOOK_SECRET` — not yet configured
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — not yet configured

**Supabase project:** `owmympqvgeekogqzumzl` (us-east region)

---

## BUSINESS MODEL (non-negotiable)

```
Writer pays $5/month → publishing rights + profile + analytics
Reader subscribes to writer → writer sets their own price (min $2/month)
Writer earns from: subscriptions + gifts + donations + digital product sales
Rafael earns: $5/writer/month + 10-12% of all writer revenue via Stripe Connect
Readers pay nothing to Rafael directly
```

**Math at scale:**
- 1,000 writers × $5 = $5,000/month guaranteed
- 1,000 writers × avg $200 reader revenue × 10% = $20,000/month
- **Total: $25,000/month at 1,000 writers**

---

## PRODUCT PRINCIPLES

Think like Bezos building the Kindle Store — writers are the product, discovery is the moat, monetization must feel dignified.

1. **Writers first.** Every feature decision: "does this make writers more successful?" If yes, build it.
2. **Discovery is the moat.** The algorithm surfacing great stories to new readers is worth more than any feature.
3. **The $5/month writer fee stays forever.** It filters spam and creates a serious creator community. Never remove it.
4. **One free chapter, always.** First chapter of every story is always free. This is the hook. Non-negotiable.
5. **Mobile-first.** 80%+ of reading happens on phones. Design mobile-first, desktop-second.
6. **Monetization feels dignified.** Gifts and subscriptions feel like appreciation — not begging.

---

## COMPETITIVE POSITION

| Platform | Problem | bio.me's answer |
|----------|---------|-----------------|
| Substack | For newsletters, not narratives | Built exclusively for life stories |
| Wattpad | Terrible monetization | Earn from day 1 |
| Medium | Platform controls earnings | Writers set their own price |
| Patreon | Generic, no story format | Story-first UX + chapter series |

**Unique position:** The only platform where telling your life story is a viable full-time income.

---

## PAYMENTS — STRIPE CONNECT

Use **Stripe Connect** (not standard Stripe) so writers receive payouts directly to their bank accounts. Rafael collects 10% as the platform fee automatically on each transaction.

```
Reader pays $10/month to writer →
  Writer receives $9 (after 10% platform fee) →
  Rafael receives $1 automatically via Stripe Connect
  Stripe takes ~2.9% + $0.30 from the gross
```

---

## BRAND & DESIGN

- **Name:** bio.me — personal, intimate, yours
- **Tagline:** "Your story. Your income."
- **Tone:** Warm, empowering, literary premium — like a luxury journal meets creator economy
- **Primary:** Deep ink black `#0D0D0D`
- **Accent:** Gold `#C9A84C` — value, wealth, achievement
- **Background:** Cream `#FAF7F0` — feels like a quality book
- **Fonts:** Playfair Display (headings) + Inter (body)
- **No generic SaaS blue.** bio.me feels like a bookstore, not a dashboard.

---

## GO-TO-MARKET (90 days)

**Days 1-30:** 50 founding writers recruited manually via DM (TikTok, Instagram, X storytellers). Founding price locked at $5/month forever. No reader marketing yet — build content library first.

**Days 31-60:** Open to readers. Product Hunt launch. Rafael documents building bio.me in public on X/TikTok.

**Days 61-90:** Target 200 writers ($1,000 MRR guaranteed) + reader subscriptions ($2,000-5,000 additional at 10%). **First month goal: $3,000-6,000 total platform revenue.**

---

## CODING RULES

- TypeScript everywhere — no `.js` files except config
- Tailwind for all styling — no CSS modules
- Supabase client for all DB operations
- All API routes validate with Zod before touching the DB
- Never hardcode API keys — always `.env.local`
- Functional components only, no class components
- `kebab-case` files, `PascalCase` components

---

## RAFAEL'S RULES FOR CLAUDE

1. **Always run on port 8000.** Command: `next dev -p 8000`
2. **Never mix bio.me and Cliente Loop configs or code.**
3. **Writers first** — every feature starts with "how does this help writers earn more?"
4. **Ship fast.** Working beats perfect. MVP over polish.
5. **Stripe Connect** is the payment backbone — do not propose alternatives.
6. **When in doubt, ask Rafael.** Fast question beats 30 minutes of wrong-direction code.
