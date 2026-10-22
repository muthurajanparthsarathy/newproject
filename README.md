# Prova Media — Website

Premium Next.js website for **Prova Media**, a digital agency in Coimbatore offering
website development, digital marketing, software, and photography.

Built with Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4 and Framer Motion.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Copy env template and fill in values (only NEXT_PUBLIC_SITE_URL is required)
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open <http://localhost:3000>.

---

## Available scripts

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Start the dev server with Turbopack            |
| `npm run build`  | Build the production bundle                    |
| `npm run start`  | Run the production bundle (after `build`)      |
| `npm run lint`   | Run ESLint across the project                  |

---

## Environment variables

| Name                   | Required | Default                  | Description                                                                |
| ---------------------- | -------- | ------------------------ | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Yes      | `https://provamedia.com` | Canonical site URL — used for sitemap, robots, OG, canonical tags, JSON-LD |

---

## Deploying

### Option 1 — Vercel (recommended, zero config)

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Go to <https://vercel.com/new>, import the repo.
3. Vercel will detect Next.js automatically. Click **Deploy**.
4. After the first deploy, go to **Project Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SITE_URL` = your production domain (e.g. `https://provamedia.com`)
5. Optional — point your domain at Vercel via **Project Settings → Domains**.

That's it. The included `vercel.json` already pins the build region to `bom1` (Mumbai) for low latency
to Indian users and adds 301 redirects for legacy URLs.

### Option 2 — Self-hosted Node server

```bash
npm install
NEXT_PUBLIC_SITE_URL=https://provamedia.com npm run build
NEXT_PUBLIC_SITE_URL=https://provamedia.com npm run start
```

The app serves on port `3000` by default. Put it behind nginx / Caddy / Cloudflare for TLS.

### Option 3 — Docker

A minimal Dockerfile would look like:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## Project structure

```
app/                    Next.js App Router pages
  layout.tsx            Root layout — metadata, JSON-LD, fonts
  page.tsx              Homepage
  not-found.tsx         404 page
  error.tsx             Production error boundary
  global-error.tsx      Last-resort error boundary
  manifest.ts           PWA manifest
  robots.ts             robots.txt generator
  sitemap.ts            sitemap.xml generator
  icon.png              Favicon (auto-served by Next.js)
  apple-icon.png        iOS home-screen icon
  about/                /about route
  contact/              /contact route
  portfolio/            /portfolio route
  products/             /products and /products/[slug]
  services/             /services and /services/[slug]
components/
  layout/               Navbar, Footer, mobile CTA
  sections/             Page-level sections (hero, pricing, faq, …)
  ui/                   Primitive UI: Button, Input, Section, Reveal
lib/
  content.ts            Source-of-truth data (services, products, pricing, FAQs)
  hero-slides.ts        Hero auto-rotating slide content
  seo.ts                Keywords, JSON-LD generators
  utils.ts              SITE constants, cn(), buildWhatsAppLink()
public/
  hero2.png             Hero illustration
  logo.png              Brand logo (also referenced from app/icon.png)
```

---

## What's wired up

- **SEO**: per-page titles, descriptions, keywords, OG, Twitter cards.
- **Schema.org JSON-LD**: Organization, LocalBusiness, ProfessionalService, WebSite,
  Service (per service page), FAQPage, BreadcrumbList.
- **Sitemap**: 18 URLs — auto-generated at `/sitemap.xml`.
- **Robots**: indexable by default, points crawlers at the sitemap.
- **Favicons**: brand logo as `/icon.png`, `/apple-icon.png`, manifest.
- **Security headers** (set in `next.config.ts`):
  - HSTS, X-Content-Type-Options, X-Frame-Options
  - Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy
- **Performance**:
  - Static export of every page (18 SSG routes)
  - AVIF/WebP image transforms with 30-day edge cache
  - `next/font` optimized self-hosted Inter & Poppins
  - Gzip/Brotli compression on
- **Forms**: contact form opens WhatsApp pre-filled (no backend required).

---

## Editing content

Almost all copy lives in **`lib/content.ts`** — services, products, pricing tiers,
FAQs, portfolio. Edit there and the site updates everywhere.

## Writing a blog post

Blog posts are Markdown files in **`content/blog/`** — the file name is the URL
(`content/blog/my-post.md` → `/blog/my-post`).

1. Copy `content/blog/_template.md`, rename it, and fill in `title`,
   `description` and `date` at the top. The template explains every field.
2. Write the post below the second `---`. `##` headings become the
   "On this page" list.
3. Put images in `public/images/blog/<post-name>/`.
4. Commit and push (or use **Add file** on github.com) — Vercel deploys it.

**Scheduling:** a post goes live at 00:00 IST on its `date`. Blog pages
re-check hourly, so you can push a week of future-dated posts at once and
each appears on its day without another deploy. `draft: true` keeps a post
hidden. In `npm run dev`, drafts and scheduled posts are shown with a badge
so you can preview them.

Hero rotating headlines live in **`lib/hero-slides.ts`**.

Site-wide constants (phone, email, address, socials) live in **`lib/utils.ts`**.

SEO keywords and JSON-LD generators live in **`lib/seo.ts`**.

---

## License

Proprietary — © Prova Media.
