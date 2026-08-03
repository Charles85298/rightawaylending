# Right Away Lending Website Package

## Package contents

- `index.html` — complete responsive homepage
- `css/styles.css` — design system and responsive styles
- `js/app.js` — theme toggle, mobile menu, FAQ, and calculator behavior
- `images/logo-transparent.png` — approved transparent logo
- `images/hero-home.jpg` — Arizona home hero image
- `404.html` — simple not-found page
- `robots.txt` and `sitemap.xml` — launch placeholders
- `assets/manifest.json` — basic web app metadata
- `documents/` — project source materials

## Local preview

Open `index.html` in a browser. For the most accurate behavior, serve the folder with a local web server:

```bash
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Before launch

1. Replace `https://www.example.com/` in `robots.txt` and `sitemap.xml` with the final domain.
2. Confirm the official contact email and update any placeholder email addresses.
3. Connect the pre-qualification CTA to the approved secure application or CRM.
4. Replace review and team placeholders with approved content.
5. Add final privacy, licensing, Equal Housing, and state-specific disclosures after compliance review.
6. Add analytics and Search Console ownership.
7. Compress and convert production imagery to WebP/AVIF if desired.
8. Test across Chrome, Safari, Firefox, Edge, iOS, and Android.

## Brand tokens

- Navy: `#002244`
- Support Blue: `#245998`
- Action Green: `#69BE28`
- Wolf Gray: `#A5ACAF`
- Ice White: `#F8FAFC`
- Charcoal: `#1E293B`

## Deployment

This folder can be uploaded directly to:

- GitHub Pages
- Netlify
- Cloudflare Pages
- cPanel/shared hosting
- Any static web host

No build process is required.

## Version 2 additions

- `first-time-buyers.html`
- `homebuyer-guide.html`
- `down-payment-assistance.html`
- `document-checklist.html`
- `mortgage-glossary.html`
- `affordability-calculator.html`

These pages are educational and contain compliance-aware language. Final content, links, disclosures, program details, and legal review are still required before launch.

- Version 3 updates the affordability calculator with interactive range sliders and live formatted values.

- Version 4 adds an interest-rate slider, live illustrative principal-balance estimate, and accessible hover/focus help comments for every affordability slider.

- Version 5 corrects the calculator interaction: the interest-rate slider now directly changes estimated monthly principal and interest. A loan-amount slider was added, and the result is compared with the illustrative housing budget.

- Version 6 upgrades the affordability tool into a two-mode mortgage calculator:
  - How much can I afford?
  - Estimate my payment
  - Home price, down payment, 2%–12% rate, 15/20/25/30-year term, taxes, insurance, HOA, and mortgage-insurance controls
  - Live payment breakdown and visual composition bar
  - Estimated total interest and loan amount

- Version 7 adds a branded calculator report:
  - Save Branded PDF button
  - Right Away Lending logo and brand colors
  - Current calculator inputs and results
  - Payment breakdown and assumptions
  - NMLS and educational disclosure
  - Uses the browser print dialog; choose "Save as PDF" as the destination

- Version 9 improves calculator readability and visual hierarchy:
  - Higher-contrast white text in the graph/results area
  - Larger 280px payment donut
  - Stronger central payment typography
  - Card-style legend and payment rows
  - Larger numeric values
  - Full-width green Save My Mortgage Report (PDF) action

- Version 10 fixes clipped graph labels by removing the separate right-side legend.
- The donut chart is centered and enlarged to 320px.
- Payment breakdown rows now act as the legend with matching color dots and values.

- Version 11 adds visible affordability-mode sliders for:
  - Illustrative interest rate from 2% to 12%
  - Loan term with 15-year and 30-year choices
- These values now update the supported-principal estimate and appear in the branded PDF report.

- Version 12 fixes calculator result behavior:
  - The donut total now updates from principal and interest, taxes, insurance, mortgage insurance, and HOA dues.
  - The payment graph is forcibly hidden in affordability mode and shown only in payment-estimate mode.
  - Monthly HOA dues are now available in both calculator modes.
  - In affordability mode, HOA dues reduce the monthly amount available for principal and interest.
  - HOA values are included in the branded PDF report.

- Version 13 adds the Mortgage Comparison Center:
  - mortgage-comparison.html
  - conventional-loans.html
  - fha-loans.html
  - va-loans.html
  - usda-loans.html
  - jumbo-loans.html
  - loan-qualification-wizard.html
  - responsive comparison table
  - interactive educational recommendation wizard

- Version 14 repairs mobile responsiveness across the homepage and shared page system:
  - Compact mobile header and full-screen navigation drawer
  - Smaller responsive logo and typography
  - Single-column hero actions, trust signals, cards, footer, and CTA sections
  - Proper mobile spacing and no horizontal overflow
  - Touch-friendly comparison tables, calculators, tooltips, and sticky actions
  - Extra optimization for screens below 390px

- Version 15 adds a dedicated tablet responsive pass for 701px–1100px:
  - Tablet navigation with logo, CTA, theme toggle, and hamburger
  - Two-column trust bar and card layouts
  - Tablet-specific hero sizing and image focal point
  - 60/40 calculator layout with sticky results panel
  - Two-column footer
  - Improved comparison tables and wizard controls
  - Landscape tablet and iPad Pro portrait refinements

- Version 16 introduces the flagship homepage:
  - Premium hero and live mortgage snapshot
  - Animated metrics
  - Interactive loan finder
  - Seven-step homebuying timeline
  - Embedded calculator preview
  - Premium feature cards
  - Testimonial carousel
  - Floating quick-action menu
  - Scroll-reveal animation with reduced-motion support
  - Responsive desktop, tablet, and mobile layouts

- Version 17 adds the formal UI design system:
  - `css/tokens.css`
  - `ui-components.html`
  - `documents/Design-System-v17.md`
  - Standardized focus states, hover interactions, motion reduction, and shared design tokens

- Version 18 adds lead-generation infrastructure:
  - `prequalify.html`
  - `schedule.html`
  - `buyer-guide.html`
  - Multi-step inquiry flow with validation
  - Scheduling platform placeholder
  - Lead-magnet capture interface
  - Updated homepage and navigation CTAs
  - No personal data is transmitted until a CRM or secure application is connected

- Version 19 adds production-quality SEO, accessibility, performance, compliance, and resource-center foundations.
- All legal, licensing, and policy content remains placeholder material pending qualified review.
- Replace `https://www.example.com` with the final production domain before launch.

- Version 20 is the launch-foundation release.
- It includes service-worker support, analytics hooks, security configuration examples, launch documentation, QA documentation, and deployment status tracking.
- The site is still a static demonstration until the CRM, scheduler, secure application, production domain, and approved compliance content are connected.
