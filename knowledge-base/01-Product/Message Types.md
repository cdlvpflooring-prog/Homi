# Message Types & Use Cases

Every message sent in Homi has a `MessageType` — a string union that determines how the message is categorized, displayed, and prioritized.

---

## Full MessageType Union

```typescript
export type MessageType = 
  | 'parking_alert'      // Someone is parked illegally or blocking
  | 'blocking'           // Your car is blocking mine
  | 'window_open'        // Your window is open
  | 'lights_on'          // Your headlights/interior lights are on
  | 'for_sale'           // This car is for sale
  | 'general'            // Generic message
  | 'compliment'         // Good driving compliment
  | 'safety'             // Safety-related alert
  | 'marketplace'        // Marketplace inquiry
  | 'service_ad'         // Service provider advertisement
  | 'keys_visible'       // Keys visible in car
  | 'trunk_open'         // Trunk is open
  | 'gas_cap'            // Gas cap left off
  | 'flat_tire'          // Flat tire alert
  | 'brake_light'        // Brake light out
  | 'hazard'             // Road hazard
  | 'child_pet_alert'    // Child or pet left in vehicle
  | 'break_in_alert'     // Vehicle break-in in progress
  | 'tow_warning'        // Tow truck approaching
  | 'street_cleaning'    // Street cleaning enforcement
  | 'event_notice'       // Event-related notice
  | 'community_watch'    // Community neighborhood watch
  | 'report_driver'      // Report a driver
  | 'car_alarm'          // Car alarm going off
  | 'vehicle_alarm'      // General vehicle alarm
  | 'leaking_fluid';     // Vehicle is leaking fluid
```

---

## Categorization by Intent

### Safety Alerts (High Priority)
| Type | When to use |
|------|------------|
| `child_pet_alert` | Child or pet left unattended in a hot/unsafe car |
| `break_in_alert` | Active break-in or theft in progress |
| `tow_warning` | Tow truck is hooking or about to move the vehicle |
| `hazard` | Road hazard caused by or near the vehicle |
| `car_alarm` / `vehicle_alarm` | Alarm going off unattended |

### Vehicle State Alerts (Medium Priority)
| Type | When to use |
|------|------------|
| `lights_on` | Headlights or interior lights left on (battery risk) |
| `window_open` | Window left open (weather or theft risk) |
| `trunk_open` | Trunk not fully closed |
| `gas_cap` | Gas cap missing or open |
| `flat_tire` | Visible flat tire while driving |
| `brake_light` | Brake light burned out |
| `leaking_fluid` | Visible fluid leak under the vehicle |
| `keys_visible` | Keys visibly left in car |

### Parking & Community
| Type | When to use |
|------|------------|
| `parking_alert` | Parking violation (handicap, fire lane, etc.) |
| `blocking` | Blocking a driveway or another vehicle |
| `street_cleaning` | Street cleaning day / risk of ticket |
| `event_notice` | Event-related parking or movement needed |
| `community_watch` | Neighborhood watch notice |

### Social & Commerce
| Type | When to use |
|------|------------|
| `for_sale` | Car or item for sale |
| `compliment` | Positive message about driving or vehicle |
| `general` | Any other message |
| `marketplace` | Marketplace item inquiry |
| `service_ad` | Service provider advertisement |
| `report_driver` | Reporting a driver's behavior |

---

## Message Priority

Each message can optionally carry a `priority` field:
- `'low'` — informational
- `'medium'` — worth noticing
- `'high'` — time-sensitive
- `'urgent'` — requires immediate attention (e.g., `child_pet_alert`, `break_in_alert`)

---

## Adding a New Message Type

See [[SOP - New Message Type]] for the step-by-step procedure.

---

## Related Notes

- [[Data Models]] — Full `Message` interface definition
- [[SOP - New Message Type]] — How to add a type to the system
