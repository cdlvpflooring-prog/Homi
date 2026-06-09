# Roadmap & Future Enhancements

## Current Status

**MVP Grade: A+ (95/100) — Approved for Production**

All MVP success criteria have been met. The app is cross-platform, fully typed, accessible, and error-resilient.

---

## Known Limitations (Non-Blocking)

| Issue | Impact | Note |
|-------|--------|------|
| Slider component web compatibility | Minor | `findDOMNode` deprecation on web |
| Image picker web limitations | Minor | Less functionality vs. native |
| Haptic feedback on web | Minor | Falls back gracefully |
| Background processing | Minor | Limited by Expo Go constraints |

---

## Post-Launch Enhancements

### High Priority

| Feature | Why | Complexity |
|---------|-----|-----------|
| Push Notification Backend | Server-side delivery for real-time alerts | Medium |
| Real-time Messaging | WebSocket for live chat between plate owners | High |
| Advanced Map Integration | MapBox or Google Maps for richer experience | Medium |
| Payment Processing | Marketplace transactions | High |

### Medium Priority

| Feature | Why | Complexity |
|---------|-----|-----------|
| Analytics Dashboard | Admin panel for community health metrics | Medium |
| Dark Mode | Tokens already defined — needs context provider | Low |
| Dynamic Type Support | iOS Dynamic Type / Android font scaling | Low |
| Internationalization | Non-Latin character sets, RTL | Medium |
| Linting Rules | Prevent hard-coded colors, enforce token usage | Low |

### Low Priority

| Feature | Why | Complexity |
|---------|-----|-----------|
| A/B Testing for Notifications | Optimize open rates | Medium |
| Rate Limiting | Prevent notification/message spam | Medium |
| Custom Brand Font | Optional brand-specific typeface | Low |
| Responsive Tablet Scaling | Auto-adjust for iPad/Android tablet | Low |
| Offline Queue Sync | Queue messages offline, sync on reconnect | High |

---

## Design System TODOs

From the Style Enforcement Report:
- [ ] Apply design tokens to all remaining screens (partially done on some tabs)
- [ ] Implement dark mode context provider
- [ ] Create ESLint rules to prevent hard-coded colors
- [ ] Write component library documentation

---

## Infrastructure Improvements

- [ ] Connect to production push notification service (FCM/APNs)
- [ ] Add crash reporting (Sentry or similar)
- [ ] Add user behavior analytics with privacy compliance
- [ ] Implement notification engagement tracking

---

## Related Notes

- [[Project Vision & Goals]] — Core goals driving prioritization
- [[System Diagnostic]] — Current system health baseline
- [[MVP Quality Report]] — What has been validated
