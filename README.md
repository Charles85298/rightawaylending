# Right Away Lending — website brand update

The complete website has been migrated to the navy, electric blue, Right Away red, chrome, and light-surface design shown in the supplied homepage reference. It contains 34 pages: the original 32, plus dedicated investment-property and refinance pages.

**Use `dist/` for the website build. Do not publish the repository root:** it preserves original internal source documents and historical artwork that are excluded from the public package.

## Run locally

Requires Node.js 24.19.0 (pinned in `.node-version`) and npm. Browser pages have no third-party runtime dependencies.

```powershell
npm ci
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4175`. To choose another port:

```powershell
npm start -- --port 4180
```

The server binds only to the local computer. The browser uses local relative links, so reviewing a loan program stays in this candidate instead of navigating to the live site.

## What changed

- Shared header, mobile navigation, footer, page heroes, forms, cards, tables, labels, focus states, dark mode, favicons, and print styling across the entire site.
- The reference homepage, its lightning explorer, and its loan finder now connect to the site's actual program pages.
- Fixed-rate mortgage and affordability calculations, a refinance break-even tool, printable mortgage summaries, and safe handling of zero balances and down-payment limits.
- Working five-step educational wizard and local inquiry preparation with Back navigation, validation, and accurate completion messages.
- Checklist progress/reset, glossary search/empty states, all-resource navigation, and immediate guide access.
- Browser storage failure no longer breaks the site; only the theme preference is stored.
- Offline support caches a limited set of public educational pages and named static assets. It does not cache inquiry URLs, query data, third-party requests, or form submissions.
- Five-state company/licensing disclosures, a company-specific NMLS Consumer Access link, and the original Texas consumer complaint notice.
- The owner-confirmed phone/email workflow includes a local worksheet with validation, accurate completion messages, and a Clear Worksheet control.
- The candidate verification workflow tests/builds without publishing. The retained GitHub Pages workflow is manual and publishes only `dist`; it is not proof of a deployment to the company domain.

## Structure

| Location | Purpose |
| --- | --- |
| Root HTML pages | Editable static page content and shared shell |
| `css/tokens.css` | Reference brand tokens |
| `css/styles.css` | Reference design and component styling |
| `css/site.css` | Final shared-page, responsive, contrast, and print rules |
| `js/app.js` | Shared navigation, forms, wizard, glossary, checklist, and tools |
| `js/home.js` | Homepage lightning explorer and loan finder |
| `js/calculator.js` | Detailed calculator UI and print report |
| `js/mortgage-math.js` | Tested financial arithmetic, without pricing or eligibility decisions |
| `scripts/check-site.cjs` | Static site integrity checks |
| `scripts/build.cjs` / `scripts/public-assets.cjs` | Validated exact-inventory public build |
| `scripts/public-assets.json` | 55 served files and two parsed hosting controls |
| `scripts/serve.cjs` | Local preview server |
| `tests/` | 54 automated checks |
| `documents/BRAND-SYSTEM.md` | Implemented design system |
| `documents/RELEASE-VERIFICATION.md` | Verification evidence and limits |
| `dist/` | Generated website files only |

## Review and launch boundary

**The redesign is locally verified and prepared for release; it is not deployed.** Correct Cloudflare access is established. Company confirmations, the release-time build/HTTPS settings, and final publication approval remain in `documents/LAUNCH-HOLD.md`.

The original site did not contain a working inquiry-submission backend or appointment-booking integration. The candidate accurately provides on-device inquiry preparation and direct phone/email contact. Entries are not transmitted or stored. No mortgage application is submitted and no appointment is booked.

The placeholder privacy, terms, and licensing pages were replaced. NMLS Consumer Access was read directly and lists six approved/authorized entries across Arizona, Florida, Michigan, Texas, and Washington. The source record and applicable advertising/disclosure references are documented in `documents/COMPLIANCE-SOURCES.md`. This is not regulator certification or a substitute for the company's financial privacy notice. Florida's displayed renewal-year discrepancy and any continuing Washington order obligations remain for company confirmation.

Cloudflare Worker `rightawaylending` serves both company hostnames from `Charles85298/rightawaylending`, production branch `main`. The current live source is `5772cc93ca469bf92b0a556731c60ae3e76bbf04`, the earlier UI with the approved asset-publication security fix. This launch branch preserves that upstream history and imports the reviewed redesign. No force-push or unrelated-history replacement is needed.

At approved release time set the Worker's build command to `npm ci --ignore-scripts --no-audit --no-fund && npm test && npm run build`; keep the existing pinned `npx wrangler@4.134.0 deploy` command. The asset directory is `./dist`. Workers Builds uses the dashboard build command, not a Wrangler custom build block. Do not publish this source root or run the separate manual GitHub Pages publication as a substitute for the company-domain release.

## Preservation and rollback

The original ZIP and the ZIP-derived review repository at `C:\Users\teedu\Projects\Right Away Lending Website` remain untouched. Its reviewed candidate is `3f9e4a937f8e2aabb9da49dbefb16a2338b2d569`. This launch worktree is `C:\Users\teedu\Projects\Right Away Lending Website Launch`, branch `codex/website-redesign-launch`, based on live-source commit `5772cc93ca469bf92b0a556731c60ae3e76bbf04`. The Command Hub CRM is outside this release.

The known-good live Worker version is `dfd5482d-97b8-4b8e-9b36-63fa894b19c6`. A rollback would restore the earlier UI plus its security fix; do not roll back to pre-fix versions. See the release checklist for the difference between Worker-version rollback and source rebuild.

Only the generated build folder is cleared by `npm run build`. Its absolute path is checked before cleanup. The current public file hashes are written to `artifacts/public-files.sha256`.

Stop an active local Wrangler preview before rebuilding on Windows: its directory watcher can hold the generated `dist` directory open. Then rebuild and restart the preview. Do not delete or modify another session's working directory to work around a file lock.
