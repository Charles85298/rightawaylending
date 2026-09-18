# Right Away Lending — final website brand implementation

Implemented 2026-09-18 from the owner's local homepage reference at `http://127.0.0.1:4173/preview.html#loan-finder`.

## Shared visual language

| Role | Value | Use |
| --- | --- | --- |
| Command navy | `#001020` | Navigation, hero, footer, results panels |
| Electric blue | `#00A8F0` | Focus, directional effects, selection, structural accents |
| Accessible blue | `#006B9F` | Links and small text on light backgrounds |
| Right Away red | `#D32632` | Decisive calls to action and restrained brand accents |
| Deep red | `#A81820` | Hover / pressed action treatment |
| Chrome | `#AFC4D6` | Supporting text and highlights on dark backgrounds |
| Ice white | `#F2F8FF` | Light working surfaces |
| Charcoal | `#061927` | Supporting dark surfaces |

The approved-reference wordmark and standalone house/lightning image are reused without redrawing them. Light mode uses white or ice content surfaces beneath navy headers and heroes. Dark mode preserves the same content and hierarchy. Existing `--green` variable names are compatibility aliases to red; they do not render the former green brand.

`css/tokens.css` contains the base tokens. `css/styles.css` preserves the reference's visual treatment. `css/site.css` carries shared interior-page, accessibility, responsive, print, and contrast corrections. The embedded reference background was moved into a separate file without changing its image bytes; the reference stylesheet decreased from 825,397 to 104,194 bytes.

## Interaction rules

- Every page has consistent navigation, mobile navigation, contact links, theme control, footer, and skip link.
- Selected controls expose `aria-pressed`; calculator modes use keyboard-operable tabs.
- Wizard steps move focus to the current heading, retain Back navigation, and explain validation failures.
- Input labels and table headings are explicit. FAQ answers expose expanded state.
- Motion is ornamental and disabled by `prefers-reduced-motion`.
- User input stays in page memory. Only the light/dark theme preference is persisted.
- Printed mortgage reports use the new identity and distinguish sample inputs from an offer or approval.

## Ownership of content

The public shell pairs the approved visual brand with Right Away Lending Corp, company NMLS 2412327, all five states, state identifiers, and direct NMLS Consumer Access and Texas complaint-notice links. Legal identity and displayed license status were checked directly against NMLS Consumer Access on September 18, 2026; see `COMPLIANCE-SOURCES.md` for evidence and unresolved record questions.

Privacy, terms, and licensing placeholders were replaced with substantive website-specific disclosures. Homepage sample-rate/payment promotions were removed. Calculator inputs and reports explain their planning assumptions and limitations. This implementation does not certify regulatory compliance or supply the company's separate financial privacy notice.
