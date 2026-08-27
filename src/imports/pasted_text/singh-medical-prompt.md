# Figma Make Prompt — Singh Medical Stores Full Website (Master Prompt)

Use this as one single prompt in a fresh Figma Make project (or paste as final follow-up if continuing the same thread). It consolidates everything discussed and adds the missing pieces (testimonials, FAQ, legal pages, order tracking, 404).

---

Build a complete, modern, minimal B2B wholesale ordering website for a pharmaceutical distributor called **Singh Medical Stores**, based in Padrauna, Uttar Pradesh. Retail pharmacy owners browse a wholesale catalogue and place bulk orders; admin staff manage orders and products. Use React + latest Tailwind CSS only (Tailwind v4, utility classes inline, no separate .css files, no CSS-in-JS). Use realistic mock/local state data throughout — no real backend or API calls.

## Brand & Visual Direction
- Primary/action color: pharma green (#0F9D58 range — saturated, trustworthy, medical, not neon/pastel)
- Secondary/base: white and off-white (#FAFAFA / #F5F7F5)
- Neutral text: charcoal, not pure black
- Status colors: amber (pending), blue (in-progress), red (cancelled), green (delivered)
- Style: modern minimal but distinctive — generous whitespace, a geometric sans for headings + a highly readable sans for body, soft layered shadows over flat borders, rounded-xl/2xl corners throughout, hover-lift micro-interactions, and one repeated signature motif: a soft green gradient blob/accent shape used sparingly on hero and empty states.
- Avoid: generic SaaS gradients, boxy hard-bordered cards, cluttered dashboards, stock icon packs that feel templated.
- Fully responsive, mobile-first.

## Global Components
- Sticky navbar: logo/name, links for Home / Shop / About Us / Contact Us / FAQ, search bar, cart icon with count badge, login/account icon
- Category chips (Tablets, Syrups, Injections, Eye Drops, All) reused across navbar/catalogue/product pages
- Toast/snackbar for actions (added to cart, order placed, form submitted, etc.)
- Footer: logo/tagline, quick links (Shop, About, Contact, FAQ, Terms, Privacy), contact info, WhatsApp order button, social icons (placeholder), newsletter/WhatsApp-updates signup strip, address

## Pages

### 1. Homepage
- Hero with subtle motion: heading + subheading, primary CTA ("Browse Catalogue") and secondary CTA ("Order via WhatsApp"); slow-drifting green gradient blob behind text, gentle fade/slide-in on load, a few softly bobbing medicine/product icon shapes — calm and premium motion, not bouncy
- Trust strip: stats like "500+ products", "Same-day dispatch", "Trusted by X+ pharmacies"
- Featured category cards: Tablets, Syrups, Injections, Eye Drops, linking into filtered catalogue
- How it works: 3-step visual (Browse → Add to Cart → Order via WhatsApp or Checkout)
- Featured products: horizontally scrollable product cards, "View All" link
- **Testimonials section**: 3-4 retailer testimonial cards (name, pharmacy name, city, short quote, star rating), in a clean carousel or grid, using the same card/shadow language as elsewhere
- Why choose us: 3-4 value props with icons (genuine stock, competitive net rates, fast dispatch, easy reorder)
- FAQ preview: 3-4 top questions with an accordion, "View All FAQs" link to full FAQ page
- Closing CTA band: prompt to sign up/login for saved pricing and order history

### 2. Shop / Catalogue
- Search (name/company/composition), category chips, company dropdown filter, all combinable and live-filtering
- Product grid cards: name, company, composition, pack, expiry, MRP strikethrough, net rate, computed discount % badge, scheme badge, quantity stepper, Add to Cart → "In Cart · X"
- Empty state using the signature motif

### 3. Product Detail
- Breadcrumb: Home / Category / Product Name
- Image placeholder + full details, quantity stepper, Add to Cart
- Tabs/sections: Description/Composition, Pack & Storage info
- Similar Products: horizontally scrollable, same category/company, same card component, "View All in [Category]" link
- Sticky mobile bottom bar with stepper + Add to Cart

### 4. Cart (drawer + dedicated page)
- Editable line items, live subtotal, remove item
- CTAs: "Order via WhatsApp" (outline) and "Place Order / Checkout" (primary filled)
- Empty state

### 5. Checkout
- Order summary, GST/freight shown as "calculated at confirmation" placeholder
- Delivery details form (shop name, address, contact)
- Confirm order → Order Confirmation

### 6. Order Confirmation
- Success state, Order ID, summary, "Track Order" and "Continue Shopping" CTAs

### 7. Order Tracking (public lookup, no login required)
- Simple "Enter Order ID + phone number" form
- Result view: status timeline (Submitted → Confirmed → Packed → Dispatched → Delivered), same status-pill colors used in admin

### 8. Retailer Login
- Mobile number → OTP two-step flow, separate OTP boxes, centered card layout

### 9. Retailer Order History (post-login)
- Table/list: Order ID, date, item count, total, status pill; click into order detail (reuse tracking timeline)

### 10. About Us
- Hero/banner, story/intro (Padrauna UP, years of trust — placeholder copy), mission/values cards (quality assurance, reliable supply, fair pricing, strong relationships), stats band, closing CTA

### 11. Contact Us
- Hero/banner matching About style
- Two columns: contact details card (address, phone, clickable WhatsApp button, email, hours) + contact form (name, phone, message) with success state
- Map placeholder block

### 12. FAQ Page
- Full accordion list grouped by topic (Ordering, Pricing & Discounts, Delivery, Payments, Account) with placeholder Q&A content matching the pharma B2B context

### 13. Terms & Conditions / Privacy Policy
- Simple clean legal-page template (title, last-updated date, section headings, placeholder body text) — reused layout for both pages, linked from footer

### 14. 404 / Not Found
- On-brand empty state using the signature green motif, "Back to Home" CTA

### 15. Admin Panel (distinct sidebar layout, same color system)
- Sidebar: Orders, Products, Import CSV
- Orders table: Order ID, retailer, date, items, total, status dropdown (Submitted → Confirmed → Packed → Dispatched → Delivered, Cancelled), filter by status
- Order detail view: line items, retailer info, status control
- Products table: searchable/sortable, edit affordance
- CSV Import: drag-and-drop upload, parsed-row preview before confirm, success state ("X products updated")

## Data Model (mock data, ~20 realistic pharma products)
Fields: id, name, company, composition, category, pack, mrp, net, scheme (optional), expiry. Discount % computed from mrp vs net, not hardcoded.

## Consistency Requirements
- One shared component set (product card, buttons, badges, status pills, form inputs, accordions) reused across every page — no page introduces its own visual style
- Identical spacing/typography scale/color usage everywhere
- All filtering/search is live, not submit-based
- Cart state persists across catalogue, product detail, cart, and checkout within the session
- Fully responsive, mobile-first

## Deliverable
A complete, cohesive, click-through frontend across all pages above, using mock data, visually polished and distinctive (not a generic template), ready for a developer to wire up a real backend afterward.