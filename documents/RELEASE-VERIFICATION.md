# Right Away Lending website — launch candidate verification

Date: September 18, 2026. Scope: public website redesign and safe Cloudflare packaging.

**VERIFIED: local checks below. NOT DEPLOYED: this redesign.** Company confirmation, final publication authorization and release-time host checks remain in `LAUNCH-HOLD.md`. The separate CRM is not part of this release.

## Source custody

- Working directory: `C:\Users\teedu\Projects\Right Away Lending Website Launch`.
- Git common directory: `C:\Users\teedu\Projects\Right Away Lending Website Security Fix\.git`.
- Branch: `codex/website-redesign-launch`, based on upstream/live source `5772cc93ca469bf92b0a556731c60ae3e76bbf04`.
- Reviewed redesign imported from `C:\Users\teedu\Projects\Right Away Lending Website`, commit `3f9e4a937f8e2aabb9da49dbefb16a2338b2d569`, relative to its original baseline `42d2bfc`. That repository and its unrelated history were preserved, not force-pushed.
- Original source archive remains in Downloads; recorded SHA-256 `1FE38ACAA2FD67CB9372AE88A978274159462438AB5BF87D4EDA20DA99333848` belongs to the earlier candidate record, not a fresh archive re-hash in this integration pass.
- Runtime page, CSS, JS and image bytes are the reviewed candidate's bytes. Integration changes concern publication inventory, build/hosting configuration, compatible redirects, tests and operational documents.

## Implemented release boundary

- 34 HTML pages use the approved navy, electric blue, red, chrome and light-surface system, with shared responsive navigation and the Right Away symbol.
- Homepage lightning explorer and loan finder connect to actual program pages. Calculators, glossary, guides, checklist and local inquiry worksheet remain available.
- Phone/email plus on-device worksheet only: no application, appointment booking, backend lead submission, marketing send, account login, AI decision, or CRM real-data flow is enabled.
- `scripts/public-assets.json` names exactly 57 inputs: 55 downloadable files plus `_headers` and `_redirects`, parsed by Workers but excluded from downloads.
- `scripts/public-assets.cjs` rejects invalid/duplicate paths and symbolic/junction source or output paths; copies only admitted bytes to `dist`; writes a hash manifest outside the public directory.
- Both source root and output default to denying publication. Future files, Git state, Wrangler metadata, source documents, tests, dependencies and internal config are not implicitly admitted.
- `_redirects` now has 29 relative-path rules supported by Workers; host/HTTPS redirects remain separate edge settings.
- `.node-version` pins Node 24.19.0; both GitHub workflows use it. Text checkout is pinned to LF. Cloudflare commands remain pinned to Wrangler 4.134.0.

## This pass: executed verification

| Check | Result | Boundary |
| --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed, 39 packages | Native Windows, Node 24.19.0 / npm 11.17.0; lockfile unchanged |
| `npm test` | 54 passed, zero failures/skips | 48 page/interaction/math/offline checks plus six publication tests; Node/JSDOM, not complete browser or security coverage |
| Changed-file follow-up | Six publication tests passed | Includes final Node-version/workflow binding; unchanged passing interaction groups were not rerun |
| `npm run build` | Passed | 34-page links, fragments, labels, disclosure regression, PDF hash, exact public inventory |
| Wrangler 4.134.0 `deploy --dry-run` | Exit 0 | No upload, no binding, no production deployment |
| Actual local `wrangler dev --local`, port 8792 | Running candidate inspected | 29 redirects and four header rules parsed; not the earlier custom preview server |
| `check:hosting` at local port 8792 | 92 passed, zero failed | All 55 served bytes, headers/CSP, PDF MIME, worker cache header, and 27 excluded/missing paths |
| `npm audit --json` | Zero reported vulnerabilities | Dependency advisory result at this time, not a security certification |
| Chrome at 3440, 390 and 320 CSS-pixel widths | Focused checks passed | Homepage desktop; program/mobile menu; synthetic worksheet; calculator; narrow light/dark homepage. No root overflow or failed loaded images in inspected states |
| Finder/program handoff | Verified rendered | First-home/zero-down/possible-military path produced educational VA/FHA/conventional choices, selected the VA explorer, then opened the VA page |
| Worksheet | Verified rendered | Synthetic inputs, five steps, local result with selected state/email next step, explicit nothing-submitted message, clear/reset. No call/email sent |
| Calculator | Verified rendered | Payment mode $2,943 for displayed illustrative inputs; full down payment reduced loan/interest to zero, leaving tax/insurance $367. These are test assumptions, not offered terms |
| Browser console | No warnings/errors in inspected sessions | Browser automation had pointer-action timeouts; state was inspected before resuming, and keyboard/AX activation verified the affected controls. No code change or timeout relaxation was used to label those attempts passes |

Local GET receipt: `artifacts/hosting-local.json`, timestamp `2026-09-18T18:16:39.279Z`. After that run, `_headers`, `robots.txt` and `sitemap.xml` were normalized to LF for cross-platform byte consistency. The final build passed. Targeted GETs at `2026-09-18T18:29:59.807Z` confirmed both changed public files match, CSP/nosniff still apply and `_headers` remains 404. The unchanged passing GET group was not rerun.

Final public manifest: `artifacts/public-files.sha256`, SHA-256 `756D4DF38CC780A5D24390F68E900FF63A54BB968D80733ECEE60FEB37CDDA58`. Artifacts are excluded from the website. A rebuild initially refused because the Windows preview watcher held `dist`; stopping that owned preview, rebuilding and restarting resolved it. No failure was counted as a pass. Earlier candidate browser sweeps are historical evidence, not repeated or counted as this pass.

## Confirmed host / rollback facts

Cloudflare Worker `rightawaylending` serves apex and www from `Charles85298/rightawaylending`, production branch `main`. The existing earlier UI plus asset security fix is source `5772cc93ca469bf92b0a556731c60ae3e76bbf04`, active version `dfd5482d-97b8-4b8e-9b36-63fa894b19c6`, successful build `af6a6a20-7574-41d4-977e-835aca6bb397`. That is the safe rollback anchor. Plain HTTP still needs the scoped HTTPS rule; the current Worker build command is empty and must change during the approved release window.

## Unknown / pending / not authorized by these results

- Company response on the Florida record discrepancy, Washington order obligations, and privacy/contact practices. Existing source references are in `COMPLIANCE-SOURCES.md`; technical checks are not legal clearance.
- Remote Linux CI, the redesigned production build, public byte matching, service-worker upgrade with existing visitor caches, and real-device Safari/Firefox have not run for this integrated candidate.
- No exhaustive WCAG/security audit or 100% code-coverage claim. No new analytics/availability monitor, delivery test, historical public-source exposure audit, or CRM production approval.
- The final release commit, push, production traffic switch and post-deploy receipt must be recorded when actually performed. Until then, the redesign is a locally verified release candidate only.
