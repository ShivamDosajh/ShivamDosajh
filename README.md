# ChargeGuide Advisor

A frontend-only PWA prototype for TATA.ev Customer Advisors to track, schedule and run Ease of Charging sessions. No backend — data ships as JSON seed files and every change is saved in the browser (`localStorage`).

All customer data is fictional. Nothing here represents a real person or vehicle owner.

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router (`createHashRouter`, hash URLs so GitHub Pages never 404s on a reload)
- `vite-plugin-pwa` for the installable, offline-capable app shell
- `lucide-react` icons

## Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the app and deploys it with `actions/deploy-pages` on every push to `main`.

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. The app will be published at `https://<owner>.github.io/chargeguide/`.

`vite.config.ts` sets `base: '/chargeguide/'` — if you fork this under a different repository name, update that value (and the Pages URL) to match.

## Installing the app

**Android (Chrome):** open the Pages URL, tap the **⋮** menu, then **Install app**.

**iOS (Safari):** open the Pages URL, tap **Share**, then **Add to Home Screen**.

Once installed, the app works offline after the first load — the app shell and `/data/*.json` seed files are precached.

## Resetting demo data

Open the **Guide** tab and tap **Reset demo data** at the bottom. This clears everything saved in `localStorage` and reloads the original seed data (15 fictional customers, sessions and feedback).

## Scope

This is a lean, ~4-hour build covering the full advisor journey — pending customers → schedule a visit → run the 5-step session checklist → complete → view completed sessions, ratings and estimated incentives → read the SOP guide. There is no login, no backend sync, no photo/signature capture, and no push notifications — see the PRD for what's intentionally out of scope.
