# Homi Knowledge Base

> **"When your car needs to talk."**
> Homi is a community-driven, cross-platform mobile and web app for vehicle-to-vehicle communication via license plates.

---

## Navigation Map

### [[01-Product/Product Overview|Product Overview]]
The vision, value proposition, and high-level feature set of Homi.

### [[01-Product/Feature Map|Feature Map]]
All screens, features, and user flows — organized by tab.

### [[01-Product/Message Types|Message Types & Use Cases]]
The full taxonomy of message types users can send.

### [[01-Product/User Personas|User Personas]]
Who uses Homi and why.

### [[01-Product/Roadmap|Roadmap & Future Enhancements]]
Known gaps, post-launch enhancements, and planned features.

---

### [[02-Architecture/System Architecture|System Architecture]]
Bird's-eye view of the full stack: Expo + Hono + tRPC.

### [[02-Architecture/State Management|State Management]]
How all global state works with `@nkzw/create-context-hook`.

### [[02-Architecture/Backend & API|Backend & API]]
Hono server, tRPC router structure, and how to extend it.

### [[02-Architecture/Navigation & Routing|Navigation & Routing]]
Expo Router file-based routing, tab structure, modal screens.

### [[02-Architecture/Data Models|Data Models]]
TypeScript types for every core entity (Vehicle, UserProfile, Message, etc.).

### [[02-Architecture/Storage & Persistence|Storage & Persistence]]
AsyncStorage keys, safeJsonParse, corruption detection.

---

### [[03-Design-System/Design System Overview|Design System Overview]]
Central reference for all design tokens.

### [[03-Design-System/Brand & Colors|Brand & Colors]]
Fiery Orange + Matte Black brand palette, semantic tokens.

### [[03-Design-System/Typography|Typography System]]
Type scale, weights, line heights, and usage.

### [[03-Design-System/Components & Recipes|Component Recipes]]
Buttons, cards, inputs, sheets, FABs — pre-built patterns.

---

### [[04-Development/Environment Setup|Environment Setup]]
How to get the project running from scratch.

### [[04-Development/Commands Reference|Commands Reference]]
All dev, lint, test, and build commands.

### [[04-Development/Testing|Testing Strategy]]
Jest setup, test patterns, how to run individual tests.

---

## SOPs (Standard Operating Procedures)

| SOP | Purpose |
|-----|---------|
| [[05-SOPs/SOP - New Screen|New Screen]] | Add a new route/screen to the app |
| [[05-SOPs/SOP - New tRPC Route|New tRPC Route]] | Extend the backend API |
| [[05-SOPs/SOP - New Store|New Context Store]] | Add a new global state store |
| [[05-SOPs/SOP - New Message Type|New Message Type]] | Add a new message category |
| [[05-SOPs/SOP - AsyncStorage|AsyncStorage Operations]] | Read/write persistent data safely |
| [[05-SOPs/SOP - Notifications|Notification System]] | Trigger toasts and push notifications |
| [[05-SOPs/SOP - Design Tokens|Using Design Tokens]] | Apply theme correctly in any component |
| [[05-SOPs/SOP - Debugging|Debugging & Diagnostics]] | Debug routes, test screens, and storage |
| [[05-SOPs/SOP - Git Workflow|Git Workflow]] | Branch, commit, and push convention |

---

## System Status Snapshots

- [[06-System-Status/System Diagnostic|System Diagnostic (Jan 2025)]] — 95/100, all green
- [[06-System-Status/MVP Quality Report|MVP Quality Report]] — Approved for production
- [[06-System-Status/Notification System Status|Notification System Status]] — Fully operational

---

## Quick Reference

```
App name:      "License Plate Communicator"
Brand name:    Homi
Slogan:        "When your car needs to talk."
Platform:      iOS · Android · Web (React Native + Expo)
Package mgr:   Bun
Dev server:    bunx rork start (tunnel)
API:           Hono + tRPC at /api/trpc/*
State:         @nkzw/create-context-hook + React Query
Persistence:   AsyncStorage
Primary color: #FF6B00 (Fiery Orange)
Text color:    #121212 (Matte Black)
```
