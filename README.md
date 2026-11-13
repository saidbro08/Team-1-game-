# 🔥 Neon Zone Royale

A **2D top-down browser** (Phaser) **multiplayer online battle royale** with a Node.js **WebSocket** server. 2–8 players are dropped onto one small neon-lit arena, scavenge weapons, and fight while the safe zone keeps shrinking. The last survivor wins.

Players can use a **keyboard**, a **gamepad**, or a custom **ESP32 + PSX (PS2) controller** simulated in [Wokwi](https://wokwi.com).

## Short description

- Genre: top-down shooter / battle royale
- Players per match: 2–8 (bots optional)
- Match length: ~3 minutes
- Map: one small 2D arena
- Goal: be the last player alive

## Documentation

| File | Content |
|------|---------|
| [`concept.md`](concept.md) | Game concept: story, characters, scenarios, rules, items |
| [`game_events.md`](game_events.md) | All events (past tense) with producer, consumer and payload |
| [`tech_design.md`](tech_design.md) | Tech stack, architecture, controllers (Wokwi PSX controller) |

## Team

| Name | Role |
|------|------|
| Student 1 – Arlen Kaldaraliev | Game design, client (rendering, UI) |
| Student 2 – Dmytro Simonov  | Server, networking, game logic |
| Student 3 – Saidinov Tariel | Controller (ESP32 / Wokwi), testing, documentation |

## Status

- [x] Task 1 – Game design (concept, events, tech design)
- [ ] Task 2 – Final game implementation

## Quick start (planned)

```bash
git clone https://github.com/<your-team>/neon-zone-royale.git
cd neon-zone-royale
npm install
npm run server      # starts the game server on ws://localhost:8080
npm run client      # serves the web client on http://localhost:3000
```
