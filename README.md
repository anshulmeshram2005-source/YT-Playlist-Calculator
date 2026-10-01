# YT Playlist Cal — Setup Guide

## Quick Start

1. Copy `.env.example` to `.env`:
   ```
   copy .env.example .env
   ```

2. Add your YouTube Data API key to `.env`:
   ```
   YOUTUBE_API_KEY=AIzaSy...
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

4. Open http://localhost:4321/

---

## Getting a YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Go to **APIs & Services → Library**
4. Search for **YouTube Data API v3** → Enable it
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy the key into your `.env` file as `YOUTUBE_API_KEY`

**Important:** Restrict the API key:
- Application restrictions: **HTTP referrers** → add your domain
- API restrictions: **Restrict key** → YouTube Data API v3 only

---

## Project Structure

```
visible-velocity/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro        # HTML shell + SEO
│   ├── components/
│   │   ├── Header.astro            # Sticky nav with dark mode
│   │   └── Footer.astro            # Site footer
│   ├── lib/
│   │   ├── youtube-api.ts          # Server-side YouTube API client
│   │   ├── youtube-parser.ts       # URL/ID parser
│   │   ├── time-utils.ts           # Duration formatting + calculators
│   │   └── cache.ts                # In-memory LRU cache
│   ├── pages/
│   │   ├── index.astro             # Homepage (main calculator)
│   │   ├── 404.astro               # Custom 404
│   │   ├── api/
│   │   │   └── playlist.ts         # API endpoint (server-side)
│   │   ├── faq/index.astro
│   │   ├── about/index.astro
│   │   ├── contact/index.astro
│   │   ├── privacy/index.astro
│   │   ├── how-it-works/index.astro
│   │   ├── tools/index.astro
│   │   ├── youtube-playlist-duration-calculator/index.astro
│   │   ├── youtube-watch-time-calculator/index.astro
│   │   ├── youtube-watch-time-at-1-5x/index.astro
│   │   ├── youtube-watch-time-at-2x/index.astro
│   │   └── youtube-playlist-remaining-time/index.astro
│   └── styles/
│       └── global.css              # Design system (Tailwind v4 @theme)
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── site.webmanifest
├── .env.example                    # Template — copy to .env
├── astro.config.mjs                # Astro + Tailwind + Cloudflare
└── package.json
```

---

## Deployment to Cloudflare Pages

1. Push to GitHub:
   ```
   git add .
   git commit -m "Initial production build"
   git push origin main
   ```

2. In Cloudflare Dashboard:
   - Pages -> New Project -> Connect to Git
   - Build command: `npm run build`
   - Build output directory: `dist/`
   - Node.js version: 20+

3. Set environment variable in Cloudflare:
   - `YOUTUBE_API_KEY` = your YouTube API key

4. Set custom domain: `ytplaylistcal.com`

---

## After Deployment Checklist

- [ ] Verify HTTPS is enforced
- [ ] Test the calculator with a public playlist
- [ ] Submit sitemap to Google Search Console
- [ ] Verify `/api/playlist` route is working
- [ ] Confirm `.env` is NOT committed to git
- [ ] Test dark mode toggle
- [ ] Test on mobile
