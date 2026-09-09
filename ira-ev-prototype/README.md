# iRA.ev Charging Experience — UX Prototype

A high-fidelity, interactive front-end prototype of the iRA.ev public EV charging
journey. It's a Progressive Web App (PWA) with **no backend, no API keys, and no
native build required** — it runs entirely from mock data and is designed to be
opened straight from an iPhone over your local Wi-Fi.

This is a UX experimentation sandbox, not a production app. It reproduces the
current iRA.ev charging flow (map → station → charger → charging type → recharge
calculation → payment) faithfully, and layers a hidden **UX Experiments** panel on
top so new concepts can be tried live without touching code.

## Run it

```bash
npm install
npm run dev -- --host
```

Vite will print something like:

```
Local:   http://localhost:5173/
Network: http://192.168.1.5:5173/
```

## Open it on your iPhone

1. Connect your iPhone and laptop to the **same Wi-Fi network**.
2. Open **Safari** on the iPhone.
3. Enter the **Network** URL shown by Vite (e.g. `http://192.168.1.5:5173/`).
4. Tap the **Share** icon → **Add to Home Screen**.
5. Launch **iRA.ev** from the Home Screen — it opens as a standalone app with no
   Safari browser chrome.

## What's inside

- **Station map** with mock stations, filters, search, and map controls.
- **Station details** bottom sheet with payment status, distance/ETA, charger
  summary and range prediction.
- **Charger selection**, **charging type** (amount / units / full charge), and
  **recharge calculation** screens matching the current iRA.ev experience.
- A **mock payment flow** (processing → success) — no real payment is ever made.
- An **experimental simplified flow** that combines charger + amount selection
  into a single screen.
- A hidden **UX Experiments panel** — long-press the header on any screen to open
  it. From there you can toggle individual UI elements (payment pill, range
  prediction, last-used info, sticky CTA, station card variant, simplified flow,
  etc.) and reset the prototype back to the station map.

## Project structure

```
src/
  components/   reusable UI split by domain (common, map, station, charger, payment, navigation, experiments)
  screens/      one folder per screen in the journey
  data/         mock stations, chargers, payment methods, offers
  config/       design tokens (theme.ts) and default experiment flags (experiments.ts)
  hooks/        useChargingFlow (state machine) and useExperiments (experiment context)
  types/        shared TypeScript types
  utils/        pricing/cost calculations
```

All colors, spacing and radii are centralized in `src/config/theme.ts` (and
mirrored into `tailwind.config.js`) — change them there to restyle the whole app.
All experimental UI toggles are centralized in `src/config/experiments.ts`.

## Notes

- No Google Maps key is required — the map is a self-contained, styled SVG mock
  map with pan/zoom, station markers and controls.
- Everything is mock data (`src/data/`) — nothing is persisted except your
  experiment panel preferences, which are saved to `localStorage` on-device.
- Build for production with `npm run build` if you want to host it somewhere
  other than your dev machine.
