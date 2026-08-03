# Integration Guide

## CRM
The current forms are frontend demonstrations and do not transmit personal information.

Connect the following:
- `prequalify.html`
- `buyer-guide.html`

Recommended implementation:
1. Use a server-side endpoint or approved vendor form embed.
2. Validate and sanitize all fields server-side.
3. Use HTTPS.
4. Do not collect sensitive financial documents through unsecured forms.
5. Add consent and privacy language approved by compliance.

## Scheduling
Replace the placeholder inside `schedule.html` with the approved scheduler embed.

## Analytics
Update `assets/site-config.json` and connect:
- GA4
- Search Console
- Approved advertising pixels
- CRM conversion events

`js/analytics.js` contains generic event hooks for:
- Phone clicks
- Email clicks
- Pre-qualification clicks
- Scheduler clicks
- Calculator clicks
- Form submission attempts

## Production domain
Replace:
`https://www.example.com`

Files affected:
- HTML canonical URLs
- Open Graph URLs
- Structured data
- `robots.txt`
- `sitemap.xml`
- `assets/site-config.json`
