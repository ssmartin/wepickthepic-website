# wepickthepic.app

The website for WePickThePic: homepage, privacy policy, support and terms, in English, German, Romanian and Spanish.
Plain HTML and CSS; deployed with Cloudflare Workers on wepickthepic.app (like getourcents.app).

| Page | URL | Built from (app repository, `../VoyageVault`) |
|---|---|---|
| Homepage | https://wepickthepic.app/ (and /de/, /ro/, /es/) | `docs/STORE-LISTING*.md`: tagline, proof line, description |
| Privacy policy | https://wepickthepic.app/privacy/ (and /de/privacy/ …) | `src/lib/legal.ts`, `src/locales/<language>/privacy.ts`: the policy shown in the app; the English one is binding |
| Support | https://wepickthepic.app/support/ (and /de/support/ …) | `docs/SUPPORT*.md` |
| Terms | https://wepickthepic.app/terms/ | `TERMS` in `scripts/build.mjs` (English only) |

## Changing the site

Don't edit the HTML by hand: change the texts in the app repository, then

```bash
node scripts/build.mjs        # or: node scripts/build.mjs <path to the app repository>
git commit -am "…" && git push   # Cloudflare publishes the push
```

## Before launch

- [ ] **Icon**: `assets/icon-512.png`, `apple-touch-icon.png`, `favicon.png` are a placeholder ("W" on coral) until the
      app has its own icon.
- [ ] **Terms**: have them reviewed; the effective date follows `PRIVACY_EFFECTIVE_DATE` in `src/lib/legal.ts`.
- [ ] **Store link**: replace the "Coming soon" button with the official App Store badge and link.
- [ ] Screenshots, when the store screenshots exist.

## Hosting

Cloudflare Workers (static assets), connected to this GitHub repository: pushing to `main` publishes. Custom domain
wepickthepic.app. `404.html` is the not-found page.

## Preview locally

```bash
npx serve .
```
