# User Personas

---

## Persona 1 — The Good Neighbor Driver

**Account type**: `personal`
**Core need**: Alert others, receive alerts, be a positive community member

**Typical actions**:
- Sends `lights_on`, `flat_tire`, `window_open` messages
- Receives `parking_alert` or `blocking` messages about their own car
- Rates senders after interactions, building community trust
- Earns badges over time

**App areas used**: Dashboard, Messages, Profile

---

## Persona 2 — The Safety-Conscious Driver

**Account type**: `personal`
**Core need**: Real-time safety information and emergency preparedness

**Typical actions**:
- Sets up emergency contacts in the Safety tab
- Submits `hazard`, `break_in_alert`, `child_pet_alert` incidents
- Joins local safety groups
- Uses Evidence Locker to document incidents

**App areas used**: Safety, Nearby Map, Messages

---

## Persona 3 — The Car Seller / Buyer

**Account type**: `personal` or `business`
**Core need**: Buy or sell vehicles and parts without revealing personal info

**Typical actions**:
- Lists a vehicle with photos via Marketplace
- Browses nearby listings by category
- Contacts sellers via plate message (`marketplace` type)
- Posts a `for_sale` message directly to a plate they spotted

**App areas used**: Dashboard (quick actions), Messages, Marketplace

---

## Persona 4 — The Fleet Manager

**Account type**: `fleet`
**Core need**: Oversee multiple vehicles, coordinate community communication

**Typical actions**:
- Registers multiple plates under one account
- Receives consolidated alerts for the fleet
- Uses `event_notice` and `community_watch` types
- Coordinates parking for large groups

**App areas used**: Dashboard, Profile (vehicle management), Messages

---

## Persona 5 — The Service Provider

**Account type**: `business`
**Core need**: Advertise automotive services to drivers in proximity

**Typical actions**:
- Creates a service listing with location, hours, and contact info
- Sends `service_ad` messages to relevant plates
- Manages service ratings and reviews
- Gets discovered via Nearby map and Marketplace

**App areas used**: Marketplace (service mode), Profile, Messages

---

## Persona 6 — The Municipal/Campus Manager

**Account type**: `municipal` or `campus`
**Core need**: Manage parking enforcement and post community notices

**Typical actions**:
- Sends `parking_alert`, `street_cleaning`, `event_notice` messages at scale
- Coordinates with property managers and event organizers
- Uses plate claim to own official plates

**App areas used**: Dashboard, Messages, Nearby Map

---

## Onboarding Path

All users go through the same 3-step onboarding in `app/onboarding.tsx`:
1. Contact method (email or phone) + terms
2. License plate + country/state
3. Display name + anonymous preference + notification setup

After onboarding completes, `onboarding_complete` is set in AsyncStorage and the root index redirects to `/(tabs)/dashboard`.

---

## Related Notes

- [[Product Overview]] — Full feature summary
- [[Feature Map]] — Features available per persona
