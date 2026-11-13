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
| Arlen Kaldaraliev | Game design, client (rendering, UI) |
| Dmytro Simonov  | Server, networking, game logic |
| Saidinov Tariel | Controller (ESP32 / Wokwi), testing, documentation |

## Status

- [x] Task 1 – Game design (concept, events, tech design)
- [ ] Task 2 – Final game implementation

## How to run

### Configuration

The server listens on **port 8080** (HTTP + WebSocket on the same port) and serves the web client.

| Variable | Description | Example |
|----------|-------------|---------|
| `BROKER_URL` | Event broker address | `https://edp-broker.codewithpeter.com` |
| `BROKER_USER` | Team login | `team1` |
| `BROKER_PASSWORD` | Team password (**never commit it**) | – |
| `PORT` | Server port (default `8080`) | `8080` |

Event topics (already created on the broker): `team1.match`, `team1.combat`, `team1.loot`, `team1.achievements`.

### Locally (Node.js 20+)

```bash
git clone https://github.com/saidbro08/Team-1-game-.git
cd Team-1-game-
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env and set BROKER_PASSWORD
npm run server              # game on http://localhost:8080
```

Open http://localhost:8080 in two browser tabs (a match needs at least 2 players), enter a name, press **Join**, then **Ready**.
Controls: **WASD** to move, mouse to aim, left mouse button to shoot.

Leaderboard consumer (in a second terminal):

```bash
npm run consumer:leaderboard
```

### With Docker

```bash
docker build -t neon-zone-royale .
docker run -p 8080:8080 \
  -e BROKER_URL=https://edp-broker.codewithpeter.com \
  -e BROKER_USER=team1 \
  -e BROKER_PASSWORD=your-password \
  neon-zone-royale
```

Then open http://localhost:8080.
