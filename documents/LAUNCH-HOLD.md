# Right Away Lending website — release decision checklist

Updated September 18, 2026. Supersedes the earlier Cloudflare-access hold.

**Status: local technical candidate prepared; redesign NOT DEPLOYED.** Cloudflare access now works. This is the public marketing website only, not the CRM, borrower portal, employee login, or real-data admission.

## Completed locally

- The approved 34-page redesign is integrated onto the existing public repository history in branch `codex/website-redesign-launch`.
- The existing live asset-publication fix is preserved. `dist` is the only configured asset directory, with 55 explicitly admitted served files and two parsed, non-downloadable controls. The source root denies all publication.
- Automated checks, actual local Workers runtime checks, and focused Chrome desktop/mobile walkthroughs are recorded in `RELEASE-VERIFICATION.md`.
- The original review repository and the separate CRM are unchanged. No redesign commit has been pushed or deployed as part of this local preparation.

## Company decisions still needed

1. Responsible officer confirms the Florida NMLS renewal-year discrepancy. The previously inspected record said Approved / authorized Yes but displayed renewed through 2025; do not infer either current suspension or resolution.
2. Responsible officer confirms any continuing obligations under the Washington order referenced in `COMPLIANCE-SOURCES.md`.
3. Company confirms the website privacy/contact statements match its actual practices. The website notice is not the company's GLBA financial privacy notice.
4. Brian authorizes publication of the exact reviewed release commit to `rightawaylending.com` and `www.rightawaylending.com`, including the scoped build and HTTPS changes below.

These are unresolved verification/authority questions, not an assertion that every item is a statutory prerequisite to a cosmetic edit. No fabricated legal clearance is permitted.

## Prepared deployment plan — NOT APPLIED

1. Recheck upstream `main` before publication; integrate any new source changes rather than overwriting them. Confirm Cloudflare still serves the currently recorded safe version.
2. Cloudflare account `7a581042ce06d7664abfec49504cd645`, Worker `rightawaylending`, repository `Charles85298/rightawaylending`, production branch `main`, root `/`.
3. Change the currently empty build command to `npm ci --ignore-scripts --no-audit --no-fund && npm test && npm run build`. Keep deploy command `npx wrangler@4.134.0 deploy` and preview command `npx wrangler@4.134.0 versions upload`. `.node-version` pins 24.19.0. Do this in the same attended release window: old source has no package script to satisfy the new build command.
4. Prepare a scoped Single Redirect matching only `http.host in {"rightawaylending.com" "www.rightawaylending.com"} and http.request.scheme eq "http"`. Return 301 to `concat("https://rightawaylending.com", http.request.uri.path)`, preserving query strings. Inspect existing redirect rules and ordering first. Do not change zone-wide HTTPS settings, DNS, MX/mail, certificates, or CRM hostnames.
5. Push the explicitly approved exact source and verify the remote commit. Observe the Cloudflare build, version and traffic assignment. A successful local dry run or GitHub Pages build is not evidence of production deployment.
6. Run `npm run check:hosting -- https://rightawaylending.com/`. Verify both HTTP hostnames, HTTPS www, TLS, headers, canonical routes, all 55 public bytes and denied private paths. Check the workers.dev origin for excluded files too.
7. In a fresh browser session verify desktop/mobile navigation, program/finder handoff, calculator, local worksheet/reset, contacts, licensing/PDF and service-worker update. Do not make a test call or send an email without separate direction.
8. If any required live check fails, do not announce success. Restore the recorded safe Worker version if the failed release changed traffic, then verify the old safe site. Record the actual deployed/rollback result.

## Rollback

- Safe source: `5772cc93ca469bf92b0a556731c60ae3e76bbf04`.
- Safe Worker version: `dfd5482d-97b8-4b8e-9b36-63fa894b19c6` (100% production traffic when inspected).
- Successful safe build: `af6a6a20-7574-41d4-977e-835aca6bb397`.
- A Worker-version rollback restores the previously uploaded artifact without rebuilding source. A later source rollback/rebuild also requires restoring the old empty build-command setting because that source has no `package.json`. Never force-push or discard intervening work.
- Do not restore pre-security versions that published source/internal files. Leave a correctly scoped HTTPS redirect in place unless it is itself the diagnosed fault.

## Timing and boundaries

The estimated release window after company confirmation and exact publication approval is 20–40 minutes for settings, build/deploy, and live smoke checks, assuming no new host/build failures. This is an engineering estimate, not a promise or a deadline for another person's response. Cloudflare/GitHub availability and company answers can extend it.

No recurring monitoring was configured. No new analytics, form endpoint, CRM integration, credential, consumer communication, or paid service was added. The prior approved security fix remains the live artifact until the redesign release is explicitly approved and verified.

References: [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [build image/version files](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/), [HTTPS scope](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/).
