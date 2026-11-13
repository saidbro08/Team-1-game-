# Game Events – Neon Zone Royale

The game is built as an **event-driven system** around an event broker (Redpanda, Kafka-compatible, REST proxy).

- Clients and controllers are **producers of commands**. They send *commands* (what a player asks for) to the **gateway** (game server) over WebSocket.
- The gateway validates every command, runs the authoritative game simulation, and publishes **domain events** (what happened, **past tense**) to **topics** in the broker.
- Independent **consumers** (leaderboard, achievements, replay) react to events from the broker, each in its own consumer group.

```
command (imperative)  ──►  gateway validates  ──►  event (past tense)  ──►  broker topic  ──►  consumers
   join_game                                         player_joined          team1.match
   fire_weapon                                       weapon_fired           team1.combat
```

## 1. Message formats

**Command** (client/controller → gateway, WebSocket):

```json
{ "command": "fire_weapon", "ts": 1731495600000, "data": { "angle": 1.57 } }
```

**Domain event** (gateway → broker, one record in `records[]`):

```json
{ "key": "m1731495", "value": { "event": "loot_picked_up", "ts": 1731495601000, "matchId": "m1731495", "data": { "lootId": "loot_42", "playerId": "p7", "type": "rifle" } } }
```

- `key` = `matchId`, so all events of one match are ordered (same partition).
- Event names are `snake_case`, **past tense**.

**Gateway → client message** (WebSocket only, not stored in the broker):

```json
{ "event": "state_updated", "ts": 1731495600050, "data": { } }
```

---

## 2. Commands (what a player asks for)

| Command | Sent by | Payload (`data`) | Result |
|---------|---------|------------------|--------|
| `join_game` | Client | `{ "name": "Anna" }` | `player_joined` (or `command_rejected`) |
| `set_ready` | Client | `{ "ready": true }` | `player_ready_changed`, possibly `match_started` |
| `move` | Client, Controller | `{ "dx": 0.7, "dy": -0.7 }` | Applied by the simulation, visible in `state_updated`. Not published to the broker. |
| `aim` | Client, Controller | `{ "angle": 1.57 }` | Applied by the simulation. Not published. |
| `fire_weapon` | Client, Controller | `{ "angle": 1.57 }` | `weapon_fired` (if ammo and cooldown allow) |
| `pickup_loot` | Client, Controller | `{ "lootId": "loot_42" }` | `loot_picked_up` (or `command_rejected: TOO_FAR`) |
| `use_item` | Client, Controller | `{ "item": "medkit" }` | `item_used`, `player_healed` |
| `connect_controller` | Controller | `{ "deviceId": "esp32-01", "playerId": "p7" }` | `controller_connected` |
| `leave_game` | Client | `{}` | `player_left` |
| `ping` | Client | `{ "clientTime": 1731495600000 }` | `pong` |

## 3. Domain events (what happened) and topics

**Producer** of all events below is the **gateway** unless stated otherwise.

### Topic `team1.match` – lobby and match lifecycle

| Event | Payload (`data`) | Consumers |
|-------|------------------|-----------|
| `player_joined` | `{ "playerId": "p7", "name": "Anna" }` | replay |
| `player_ready_changed` | `{ "playerId": "p7", "ready": true }` | replay |
| `controller_connected` | `{ "playerId": "p7", "deviceId": "esp32-01" }` | replay |
| `match_started` | `{ "matchId": "m1", "mapId": "arena_small", "players": [{ "id": "p7", "name": "Anna", "x": 800, "y": 900 }] }` | leaderboard, achievements, replay |
| `zone_shrunk` | `{ "phase": 2, "centerX": 800, "centerY": 600, "radius": 220, "damagePerSec": 4 }` | replay |
| `player_left` | `{ "playerId": "p9", "reason": "disconnect" }` | replay |
| `match_ended` | `{ "winnerId": "p7", "winnerName": "Anna", "results": [{ "id": "p7", "name": "Anna", "kills": 3, "score": 175 }] }` | leaderboard, achievements, replay |

### Topic `team1.combat` – fighting

| Event | Payload (`data`) | Consumers |
|-------|------------------|-----------|
| `weapon_fired` | `{ "shooterId": "p7", "weapon": "pistol", "x": 800, "y": 600, "angle": 1.2 }` | achievements, replay |
| `player_damaged` | `{ "targetId": "p9", "attackerId": "p7", "damage": 12, "hpLeft": 88 }` (`attackerId: "zone"` for zone damage) | achievements, replay |
| `player_eliminated` | `{ "victimId": "p9", "victimName": "Bartek", "killerId": "p7", "killerName": "Anna", "placement": 3 }` | leaderboard, achievements, replay |

### Topic `team1.loot` – items

| Event | Payload (`data`) | Consumers |
|-------|------------------|-----------|
| `loot_spawned` | `{ "lootId": "loot_42", "type": "rifle", "x": 900, "y": 500 }` | replay |
| `loot_picked_up` | `{ "lootId": "loot_42", "playerId": "p7", "type": "rifle" }` | achievements, replay |
| `item_used` | `{ "playerId": "p7", "item": "medkit" }` | achievements, replay |
| `player_healed` | `{ "playerId": "p7", "amount": 50, "hpNow": 100 }` | replay |

### Topic `team1.achievements` – produced by a consumer

| Event | Producer | Payload (`data`) | Consumers |
|-------|----------|------------------|-----------|
| `achievement_unlocked` | **Achievements consumer** | `{ "playerName": "Anna", "achievement": "first_blood", "matchId": "m1" }` | leaderboard (optional), replay |

### Gateway → client only (WebSocket, **not** sent to the broker)

These messages are real-time or private, so they would only add load and latency in the broker.

| Message | Recipient | Payload (`data`) | Purpose |
|---------|-----------|------------------|---------|
| `player_welcomed` | sender | `{ "playerId": "p7" }` | Reply to `join_game` |
| `lobby_updated` | all in lobby | `{ "players": [{ "id": "p7", "name": "Anna", "ready": true }] }` | Lobby list |
| `state_updated` | all in match | `{ "tick": 4521, "alive": 4, "players": [...], "bullets": [...], "zone": { "cx": 800, "cy": 600, "r": 450 } }` | Snapshot ~20×/s |
| `command_rejected` | sender | `{ "command": "pickup_loot", "code": "TOO_FAR", "message": "..." }` | Command refused |
| `controller_vibrated` | controller | `{ "intensity": 0.8, "durationMs": 200 }` | Hit feedback on hardware |
| `pong` | sender | `{ "clientTime": 1731495600000, "serverTime": 1731495600020 }` | Latency |

**Rejection codes:** `LOBBY_FULL`, `MATCH_IN_PROGRESS`, `PLAYER_DEAD`, `TOO_FAR`, `NO_AMMO`, `RATE_LIMITED`.

---

## 4. Consumers

| Consumer | Owner | Group | Topics | What it does | Output |
|----------|-------|-------|--------|--------------|--------|
| **Leaderboard** | Student 1 | `team1.leaderboard` | `team1.match`, `team1.combat` | Counts kills and wins per player; rebuilds the table by replaying from the start. | Console table / `/leaderboard` JSON |
| **Achievements** | Student 2 | `team1.achievements` | `team1.combat`, `team1.loot`, `team1.match` | Detects achievements: `first_blood`, `sharpshooter` (10 hits), `survivor` (win without damage), `medic`. | Publishes `achievement_unlocked` |
| **Replay / spectator** | Student 3 | `team1.replay` | all `team1.*` topics | Stores the ordered event log of each match and can replay it as a timeline. | `replays/<matchId>.json` |

Every consumer has its **own group**, so each one receives **every** event.

## 5. Rules for working with the broker

1. **Batch events.** The gateway keeps a queue and sends everything waiting in **one** request (`records` is an array), one request at a time.
2. `auto.offset.reset` must be **`earliest`**; a new group reads the whole topic, so it can rebuild state. Skip old events by timestamp if only new ones are needed.
3. **Retry** when creating a consumer fails with `50003 network_exception` (first ~15 s).
4. Poll with **`timeout=1000`**, never in a tight loop.
5. Never send movement (`move`, `aim`, `state_updated`) through the broker.
6. Group names must start with `team1`, topics with `team1.`.
7. The broker password is read from the `BROKER_PASSWORD` environment variable (`.env`, never committed).
