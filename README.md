# 🔥 Brand Name — Feedback Landing Page

A polished, mobile-first restaurant feedback page built with **vanilla HTML, CSS, and JavaScript** — zero frameworks, zero build steps, instant hosting.

---

## Project Structure

```
feedback/
├── index.html                  ← Production entry point (links to external CSS/JS)
├── feedback-landing.html       ← Original single-file version (preserved for reference)
├── package.json                ← Dev-server & tooling scripts
├── .gitignore
├── README.md
└── assets/
    ├── css/
    │   └── styles.css          ← All styles (extracted from original HTML)
    ├── js/
    │   └── main.js             ← All interactivity (modular, documented)
    ├── images/
    │   └── featured-dish.jpg   ← Hero dish photo (replace with your own)
    └── icons/
        └── favicon.svg         ← Brand logo mark as favicon
```

---

## Quick Start

### Option A — Open directly (no install)
```bash
# Just open index.html in any modern browser
start index.html        # Windows
open index.html         # macOS
```

### Option B — Local dev server with live reload
```bash
npm install
npm run dev
# → Opens http://localhost:3000 with auto-reload on file changes
```

### Option C — Simple static server
```bash
npx serve . --listen 3000
# → http://localhost:3000
```

---

## Customization

### 1. Update business details

Open `assets/js/main.js` and edit the `BUSINESS_CONFIGS` map:

```js
'salt-ember': {
  name:      'Brand Name',
  reviewUrl: 'https://g.page/r/YOUR_REAL_GOOGLE_REVIEW_LINK/review',
  whatsapp:  '15125550198',      // digits only, no spaces
  email:     'hello@saltember.com',
  address:   'Brand Address',
  phone:     'Brand Phone Number',
},
```

### 2. Replace the hero dish image

Drop your photo at `assets/images/featured-dish.jpg`.  
Recommended: **400 × 400 px**, square crop, high quality JPEG.  
The page automatically falls back to an emoji placeholder if the file is missing.

### 3. Connect a real backend

Both forms log to the console in demo mode.  
Search `main.js` for `// Production:` comments and uncomment the `fetch()` calls:

| Form | Suggested integration |
|------|-----------------------|
| Private feedback | Zapier / Make.com webhook → Google Sheets |
| Promo sign-up | Mailchimp API · ConvertKit · ActiveCampaign · Zapier |

### 4. Multi-tenant usage (QR code per business)

The page reads `?business=<slug>` from the URL. Add slugs to the config map:

```
https://yourdomain.com/?business=salt-ember
https://yourdomain.com/?business=another-restaurant
```

---

## Deployment

### GitHub Pages (free)

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set source to the `main` branch, root folder.
4. Your page will be live at `https://<username>.github.io/<repo>/`.

> ⚠️ GitHub Pages serves `index.html` from the root automatically.

---

### Netlify (recommended — free tier)

**Option 1 — Drag & drop**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the entire `feedback/` folder into the browser.
3. Your site is live in seconds at a `*.netlify.app` URL.

**Option 2 — Git deploy**
1. Connect your GitHub repo in Netlify.
2. Build command: *(leave blank)*
3. Publish directory: `.` (root)
4. Click Deploy.

---

### Vercel (free tier)

```bash
npm i -g vercel
vercel
# Follow prompts — no build config needed for static sites
```

Or connect the repo at [vercel.com/new](https://vercel.com/new) and set:
- Framework preset: **Other**
- Output directory: `.`

---

### Traditional / cPanel web hosting

1. Zip the project folder.
2. Upload via cPanel File Manager or FTP to `public_html/`.
3. Extract the zip.
4. Visit your domain — done.

---

### Custom domain (all platforms)

1. Add a `CNAME` file in the project root containing your domain:
   ```
   feedback.yourdomain.com
   ```
2. Point your DNS CNAME record to the hosting provider.

---

## Accessibility

- Semantic HTML5 (`<header>`, `<section>`, `<footer>`, `<address>`, `<nav>`)
- All interactive elements have descriptive `aria-label` attributes
- Modals use `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- Form fields have associated `<label>` elements
- Success regions use `aria-live="polite"` for screen reader announcements
- Keyboard: `Esc` closes any open modal
- Respects `prefers-reduced-motion` — all animations disabled for users who prefer it

---

## Performance Tips

- Fonts are loaded via Google Fonts with `display=swap` (no render-blocking)
- The hero image uses `loading="lazy"` for deferred loading
- No JavaScript framework — ~7 KB of JS total
- All CSS is ~13 KB unminified

---

## License

Private / Proprietary — for internal use at Brand Name only.
