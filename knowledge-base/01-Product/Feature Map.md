# Feature Map

Complete inventory of all features implemented in Homi, organized by screen.

---

## Dashboard (Home Screen)

- **Hero section** with welcome banner and community stats
- **Plate number entry field** — primary action, top of screen, auto-uppercase, alphanumeric only, max 12 chars
- **Quick Actions** — 20+ predefined message templates (tappable chips)
- **Recent Activity** — last sent/received messages
- **Community Highlights** — rating, badges, community score with animated progress bars
- **Notification bell** — unread count badge, modal notification center
- **Services shortcut** — quick access to roadside, fuel, car wash, food services
- **User's own plate** — displayed as a secondary reference badge (not the input target)

---

## Messages Tab

- Inbox of all sent and received plate messages
- Message list with plate numbers and preview
- Timestamps and read/unread status
- 20+ message type categories
- Rating system — post-message rating impacts community score
- Anonymous mode toggle per message

---

## Nearby Tab (Live Map)

- Real-time event map using geohash-based subscription
- 25+ incident event types with categorization
- Horizontal scroll filter chips by event type
- Upvote/downvote with confidence scoring
- FAB → Event Selection → Submission report flow
- Real-time system health diagnostics overlay

---

## Safety Tab

- **Emergency Contacts** — Editable contact cards with direct call functionality
- **Location Sharing** — Toggle to share location with trusted contacts
- **Incident Reporting** — Multi-step flow: Type → Send To → Preview → Submit
- **Safety Groups** — Join or create community safety groups
- **Evidence Locker** — Secure photo/video storage for incidents
- **Notification Settings** — Granular alert preferences (messages, listings, general)

---

## Scan Tab

- QR code scanning for plates
- Camera-based plate reading
- Deep link into message flow from scan result

---

## Profile Tab

- User profile display (display name, avatar, account type)
- Own vehicles list with primary designation
- Community score and badge display
- Rating history
- Account settings
- Verification status

---

## Onboarding Flow (3 Steps)

**Step 0 — Contact**
- Choose email or phone as contact method
- Input and basic validation
- Terms acceptance

**Step 1 — Plate + Location**
- License plate entry with country + state picker
- Supports all countries and US/CA state regions

**Step 2 — Profile**
- Display name (optional)
- Anonymous mode toggle
- Notification permission prompt
- Language selection (multi-language support)

---

## Marketplace

- **Dual mode**: Buy/Sell items + Service providers
- Full CRUD for vehicle listings and service offerings
- Multi-image upload via expo-image-picker
- Auto-detect user location for listings
- Contact via plate (no personal info exposed)
- Persistent storage via AsyncStorage

**Listing Categories**: whole_car, engine_parts, body_parts, interior, wheels_tires, electronics, accessories, tools, services

**Service Types**: body_shop, tire_service, oil_change, window_repair, detailing, mechanic, towing, inspection, insurance, parts_dealer

---

## Premium / Paywall

- Premium feature gate screen
- Controlled by `usePremium` context store

---

## Debug / Dev Screens (Available in Dev)

| Route | Purpose |
|-------|---------|
| `/system-test` | Comprehensive system health check |
| `/notification-test` | Basic notification testing |
| `/notification-system-test` | Advanced notification testing |
| `/refresh` | App refresh and AsyncStorage reset |
| `/debug-startup` | App startup diagnostics |
| `/connection-debug` | Network/API connection debugging |
| `/dev-server-status` | Rork dev server status check |

---

## Related Notes

- [[Product Overview]] — High-level summary
- [[Message Types]] — Full message type taxonomy
- [[Navigation & Routing]] — How screens are organized in Expo Router
