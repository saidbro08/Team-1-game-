# Technical Design – Neon Zone Royale

## 1. Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Game server | **Node.js** + **TypeScript** | Simple, event-driven, great for real-time networking |
| Networking | **WebSocket** (`ws` library), JSON messages | Low latency, works in browsers and on ESP32 |
| Web client | **HTML5 Canvas** + **Phaser 3** (or plain Canvas) | Fast 2D rendering, easy input handling |
| Hardware controller | **ESP32** + **PSX/PS2 controller**, simulated in **Wokwi** | Required hardware part of the project |
| Controller firmware | **Arduino C++** (PlatformIO / Wokwi), `WebSocketsClient`, `PsxNewLib` / PS2X | WebSocket client on ESP32 |
| Persistence | **SQLite** (or JSON file) | Leaderboard and player stats |
| Dev tools | Git + GitHub, ESLint, Prettier, GitHub Actions (lint + tests) | Teamwork and quality |
| Deployment | Docker, optional deploy on a small VPS / Render / Fly.io | Easy to run for the demo |

## 2. Architecture

```
 ┌──────────────────┐     WebSocket (JSON)      ┌───────────────────────────┐
 │  Web client      │ <───────────────────────> │       Game server         │
 │  (Phaser/Canvas) │                           │  Node.js + TypeScript     │
 └──────────────────┘                           │                           │
                                                │  ┌─────────────────────┐  │
 ┌──────────────────┐     WebSocket (JSON)      │  │ Connection manager  │  │
 │  ESP32 controller│ <───────────────────────> │  ├─────────────────────┤  │
 │  + PSX pad       │   (via Wokwi gateway)     │  │ Lobby / Matchmaking │  │
 │  (Wokwi)         │                           │  ├─────────────────────┤  │
 └──────────────────┘                           │  │ Match (game loop)   │  │
                                                │  │  - physics/collide  │  │
                                                │  │  - weapons/damage   │  │
                                                │  │  - loot, zone       │  │
                                                │  ├─────────────────────┤  │
                                                │  │ Persistence (SQLite)│  │
                                                │  └─────────────────────┘  │
                                                └───────────────────────────┘
```

### Server modules

- **ConnectionManager** – accepts WebSocket connections, parses JSON, rate-limits, maps socket → player.
- **Lobby / Matchmaker** – holds waiting players, starts a match when enough players are ready.
- **Match** – one instance per running game. Owns the game loop (fixed **60 ticks/s** simulation, **20 snapshots/s** (`state_updated`) sent to clients).
- **World systems** – movement + collision (simple rectangles on one small map), weapons + hit detection (ray/circle checks), loot spawner, zone controller.
- **Bot AI** – simple state machine (loot → move to zone → attack nearest).
- **Storage** – saves match results and leaderboard.

### Networking model

- **Authoritative server:** clients send input events (`player_moved`, `weapon_fired`, …), the server simulates and broadcasts `state_updated` and world events (`player_damaged`, `loot_picked_up`, `zone_shrunk`, …). See `game_events.md`.
- **Client-side prediction** for the local player (using `seq` / `lastProcessedInput` from `state_updated`) and **interpolation** for other players (render ~100 ms in the past).
- - **Reconnect:** player token kept 10 s after disconnect.
- Target: ≤ 100 ms latency, up to 8 players per match, several matches per server.

### Project structure

```
neon-zone-royale/
├── README.md
├── concept.md
├── game_events.md
├── tech_design.md
├── server/
│   ├── src/ (index.ts, lobby.ts, match.ts, systems/, bots/)
│   └── package.json
├── client/
│   ├── src/ (main.ts, scenes/, net.ts, input/)
│   └── index.html
├── controller/
│   ├── wokwi/ (diagram.json, wokwi.toml)
│   └── firmware/ (main.ino)
└── shared/ (event types, constants)
```

## 3. Controllers

The game supports three input devices. All of them are translated into the **same events** (`player_moved`, `player_aimed`, `shoot`, …), so the server doesn't care which device is used.

1. **Keyboard + mouse** (default, web client).
2. **Gamepad API** (any USB/Bluetooth pad in the browser).
3. **Custom hardware controller – ESP32 + PSX (PS2) controller in Wokwi** *(main hardware feature)*.

### 3.1 Wokwi PSX controller

- Board: **ESP32 DevKit** in Wokwi.
- Input: Wokwi **PS2 controller** element (buttons + two analog sticks).
- Output: 2 LEDs (hit indicator, connection status) and optional buzzer.

**Wiring (example):**

| PSX controller pin | ESP32 pin |
|--------------------|-----------|
| DATA (MISO) | GPIO 19 |
| CMD (MOSI) | GPIO 23 |
| ATT (CS) | GPIO 5 |
| CLK | GPIO 18 |
| VCC | 3V3 |
| GND | GND |
| LED "hit" | GPIO 2 |
| LED "online" | GPIO 4 |
| Buzzer | GPIO 15 |

**Button mapping**

| PSX input | Game action | Event |
|-----------|-------------|-------|
| Left stick | Move | `player_moved` |
| Right stick | Aim | `player_aimed` |
| R1 | Shoot | `weapon_fired` |
| Square | Reload | `weapon_reloaded` |
| Cross | Pick up | `loot_pickup_attempted` |
| Triangle | Use medkit | `item_used` |
| L1 | Switch weapon | `weapon_switched` |
| L3 | Sprint | `player_moved` (`sprint: true`) |

**Firmware logic (pseudo-code)**

```cpp
void loop() {
  ps2.read_gamepad();
  float dx = (ps2.Analog(PSS_LX) - 128) / 128.0;
  float dy = (ps2.Analog(PSS_LY) - 128) / 128.0;
  if (changed(dx, dy)) ws.sendTXT(json("player_moved", dx, dy));      // 30 Hz
  float angle = atan2(ps2.Analog(PSS_RY) - 128, ps2.Analog(PSS_RX) - 128);
  ws.sendTXT(json("player_aimed", angle));
  if (ps2.ButtonPressed(PSB_R1)) ws.sendTXT(json("weapon_fired", angle));
  // ...
}

void onServerMessage(String msg) {
  if (event == "controller_vibrated") { digitalWrite(LED_HIT, HIGH); tone(BUZZER, 800, 100); }
}
```

The ESP32 connects to the server via WebSocket (Wokwi Private Gateway / WiFi `Wokwi-GUEST`) and sends `controller_connected` with the player token to bind to a player.

### 3.2 Steering wheel (future)

For a possible vehicle mode, a steering wheel could be simulated with a **potentiometer** (steering) and two **buttons** (gas/brake) on the same ESP32. Not part of the first version.

## 4. Data and balance

- Constants (speeds, damage, fire rates, zone timing) stored in `shared/config.json`, so they can be tuned without changing code.
- Match seed (`seed` in `match_started`) makes loot placement reproducible and testable.

## 5. Security

- Server-side validation of every action; clients can't set position, HP, or damage.
- Rate limiting (60 msg/s), max message size 2 KB, rejected events answered with `action_rejected`.
- Reconnect tokens are random and short-lived.
- Basic profanity filter for chat.

## 6. Testing

- **Unit tests** (Jest) for collisions, damage, zone logic.
- **Load test** script with 8–40 fake WebSocket bot clients.
- Manual test of the Wokwi controller against a local server.
- CI: GitHub Actions runs lint + tests on every push.

## 7. Development plan

| Week | Goal |
|------|------|
| 1 | Server skeleton, lobby, join/ready events |
| 2 | Movement, snapshots, web client rendering |
| 3 | Weapons, loot, damage, death |
| 4 | Zone, win condition, results screen |
| 5 | ESP32 + PSX controller in Wokwi |
| 6 | Bots, polish, balancing, final demo |

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Lag / desync | Prediction + interpolation, low snapshot size |
| Wokwi network limits | Fallback: controller sends data via Serial → small local bridge app |
| Team time constraints | Keep MVP small (1 small map, 3 weapons, 2–8 players), extras optional |
