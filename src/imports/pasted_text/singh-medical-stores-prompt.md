# Figma Make Prompt — Singh Medical Stores B2B Portal

Copy everything below into Figma Make as one prompt.

---

Build a modern, minimal B2B wholesale ordering website for a pharmaceutical distributor called **Singh Medical Stores**. This is used by retail pharmacy owners to browse a wholesale product catalogue and place bulk orders, and by admin staff to manage orders and products. Use React + latest Tailwind CSS only (Tailwind v4, utility classes inline, no separate .css files, no CSS-in-JS libraries). Use mock/local state data — no real backend, no API calls, just realistic dummy data so all screens are fully populated and interactive.

## Brand & Visual Direction
- Primary/action color: pharma green (#0F9D58 range — pick a saturated, trustworthy medical green, not neon, not pastel)
- Secondary/base: white and off-white (#FAFAFA / #F5F7F5)
- Neutral text: charcoal/near-black, not pure black
- Accent for alerts/status: amber for pending, blue for in-progress, red for cancelled, green for delivered
- Style: modern minimal, but NOT generic SaaS-template minimal. Add character through: generous whitespace, a distinct heading font pairing (one clean geometric sans for headings, one highly readable sans for body), soft layered shadows instead of flat borders, rounded-xl or rounded-2xl corners consistently, subtle micro-interactions (hover lift on cards, smooth transitions), and one signature UI motif repeated across the app (e.g. a soft green gradient blob/accent shape used sparingly on hero/empty states — not overused).
- Avoid: purple/blue SaaS gradients, generic stock icons, boxed-in card grids with harsh borders, cluttered dashboards.
- Fully responsive: mobile-first, since many retailers will use this on phones.

## Global Components
- Sticky top navbar: logo/name "Singh Medical Stores", category links, search bar, cart icon with item-count badge, login/account icon
- Category chips row (Tablets, Syrups, Injections, Eye Drops, All) usable both in navbar and above product grid
- Toast/snackbar for actions (added to cart, order placed, etc.)
- Footer: contact info, WhatsApp order number, address (Padrauna, UP)

## Pages / Screens Required

### 1. Homepage / Catalogue
- Hero band: short intro line + trust element (e.g. "Trusted wholesale rates for retail pharmacies")
- Search bar that filters by product name, company, or composition (visually show live-filtering state)
- Category chips + Company/manufacturer dropdown filter, all combinable
- Product grid of cards. Each card shows: product name, company, composition, pack size, expiry, MRP with strikethrough, net rate, computed discount % badge, scheme badge if present (e.g. "10+1 Free"), a quantity stepper (−/+), and an "Add to Cart" button that turns into "In Cart · X" once added
- Empty search state with the signature illustration/graphic motif

### 2. Cart (slide-over drawer AND a dedicated /cart page)
- List of items with product name, qty (editable), rate, line total, remove icon
- Live-updating subtotal
- Two clear CTAs: "Order via WhatsApp" (secondary/outline style, green icon) and "Place Order / Checkout" (primary filled green button)
- Empty cart state

### 3. Checkout / Place Order
- Order summary (items, subtotal, GST/freight shown as "calculated at confirmation" placeholder)
- Delivery details form (shop name, address, contact) — no CSS files, styled Tailwind form inputs
- Confirm order button → leads to Order Confirmation screen

### 4. Order Confirmation
- Success state with Order ID, summary, estimated next steps, "Track Order" and "Continue Shopping" buttons

### 5. Retailer Login
- Mobile number input → OTP input step (visually two-step flow, OTP inputs as separate boxes)
- Clean centered card layout, medical/trust visual tone

### 6. Retailer Order History (post-login)
- Table/list of past orders with Order ID, date, items count, total, current status as a colored status pill

### 7. Admin Panel (separate section, distinct visual treatment — e.g. sidebar layout instead of top navbar)
- Sidebar nav: Orders, Products, Import CSV
- **Orders table**: Order ID, retailer, date, items, total, status dropdown (Submitted → Confirmed → Packed → Dispatched → Delivered, plus Cancelled), search/filter by status
- **Order detail view**: full line items, retailer info, status update control
- **Products table**: searchable/sortable list of all catalogue products with edit affordance
- **CSV Import screen**: drag-and-drop/upload area, preview of parsed rows before confirming, success state showing "X products updated"

## Data Model (use for mock data, generate ~20 realistic pharma products)
Fields per product: id, name, company, composition, category, pack, mrp, net, scheme (optional), expiry. Discount % must be visually computed from mrp vs net, not hardcoded.

## Interaction Notes
- All filtering (search, category, company) should feel instant/live, not "submit"-based
- Cart state persists across navigating between catalogue, cart, and checkout within the session
- Status pills and badges should use consistent color coding across the whole app

## Deliverable
A complete, cohesive, click-through frontend covering catalogue → cart → checkout → order confirmation → retailer login/history → admin panel (orders, products, CSV import), all using mock data, ready for a developer to swap in real backend calls afterward. Prioritize visual polish and a distinctive, memorable feel over generic dashboard aesthetics.