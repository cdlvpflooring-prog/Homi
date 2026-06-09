# Product Overview

## Summary

Homi is a cross-platform mobile/web application (React Native + Expo) that enables vehicle-to-vehicle communication via license plates. Users register their plates, then send or receive messages tied to any plate number.

---

## Core Concepts

### License Plate as an Address
Every message has a `fromPlate` and a `toPlate`. The sender looks up a plate (types it in or scans it), selects a message type, and sends. The owner of the target plate receives a notification if they have registered it.

### Anonymous by Default
Users can choose to be anonymous — the `isAnonymous` flag on a `Message` hides the sender's identity. Trust is built through community score and badges, not identity disclosure.

### Account Types
Homi supports multiple account modes, each with different UX and feature access:

| Type | Description |
|------|-------------|
| `personal` | Default individual driver account |
| `fleet` | Manages multiple vehicles |
| `business` | Automotive businesses, storefronts |
| `municipal` | City/government entities |
| `property_manager` | Manages parking areas |
| `event_organizer` | Event-level coordination |
| `campus` | University/campus environments |

---

## Tab Structure

The app has 5 primary tabs plus modal/stack screens:

| Tab | Screen File | Purpose |
|-----|------------|---------|
| Dashboard | `app/(tabs)/dashboard.tsx` | Main home — plate entry, quick actions, recent activity |
| Messages | `app/(tabs)/messages.tsx` | Inbox of sent/received plate messages |
| Nearby | `app/(tabs)/nearby.tsx` | Map view of local events and incidents |
| Safety | `app/(tabs)/safety.tsx` | Emergency contacts, incident reporting, safety groups |
| Scan | `app/(tabs)/scan.tsx` | QR code / camera plate scanning |
| Profile | `app/(tabs)/profile.tsx` | User settings, vehicle management, stats |

---

## Key Non-Tab Screens

| Screen | File | Purpose |
|--------|------|---------|
| Onboarding | `app/onboarding.tsx` | 3-step new user registration (email/phone → plate → profile) |
| Send Message | `app/send-message.tsx` | Full message compose screen |
| Message Detail | `app/message-detail.tsx` | Thread view for a conversation |
| Vehicle Management | `app/vehicle-management.tsx` | Add/remove/primary vehicle selection |
| Claim Plate | `app/claim.tsx` | Claim ownership of a plate |
| Safety Center | `app/safety-center.tsx` | Deep safety features |
| Live Map | `app/map-live.tsx` | Full-screen live event map |
| Paywall | `app/paywall.tsx` | Premium feature gate |
| Referral | `app/referral.tsx` | Referral program |
| Community Guidelines | `app/community-guidelines.tsx` | Rules and policies |

---

## Notification Types

- **Message** — Someone messaged your plate
- **Safety Alert** — Speed radar, parking enforcement, road hazard, emergency
- **Achievement** — Badge earned, community score milestone, weekly ranking
- **System** — App updates, feature announcements, maintenance

---

## Community & Reputation

Every user has:
- **Rating** (1–5 stars) computed from `PlateRating` entries
- **Community Score** — points accumulated from rating interactions
- **Badges** — earned through engagement and good behavior
- **Verification Status** — `unverified | pending | verified | rejected`

See [[Data Models]] for full type definitions.

---

## Related Notes

- [[Feature Map]] — Detailed feature breakdown per screen
- [[Message Types]] — Full taxonomy of sendable message types
- [[User Personas]] — Who uses each part of the app
