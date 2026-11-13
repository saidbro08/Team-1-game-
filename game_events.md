# Game Events – Neon Zone Royale

All events are sent over **WebSocket** as **JSON**. The server is **authoritative**: clients report what the player *did or tried to do* (input events), and the server decides what *actually happened* (world events).

## 1. Standard Event Structure

```json
{
  "event": "loot_picked_up",
  "ts": 1731495600000,
  "data": { }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event name, always **past tense**, `snake_case` |
| `ts` | number | Timestamp in ms (set by the producer) |
| `data` | object | Event payload (see tables below) |

**Producers / consumers:** `Client` = browser game client, `Controller` = ESP32 + PSX controller (Wokwi), `Server` = game server. Events sent by the server to "All" are broadcast to every player in the match; "Owner" means only the player concerned.

---

## 2. Events produced by Client / Controller

| Event | Producer | Consumer | Payload (`data`) | Description |
|-------|----------|----------|------------------|-------------|
| `player_joined` | Client | Server | `{ "name": "Anna", "character": "volt", "token": "abc123" }` | Player opened the game and joined the lobby (`token` only for reconnect). |
| `player_readied` | Client | Server | `{ "ready": true }` | Player toggled READY in the lobby. |
| `character_selected` | Client | Server | `{ "character": "rook" }` | Player chose a character in the lobby. |
| `player_moved` | Client, Controller | Server | `{ "seq": 128, "dx": 0.7, "dy": -0.7, "sprint": false }` | Movement input (direction -1..1), ~30×/s. `seq` is used for prediction. |
| `player_aimed` | Client, Controller | Server | `{ "angle": 1.57 }` | Aim direction changed (radians). |
| `weapon_fired` | Client, Controller | Server | `{ "angle": 1.57 }` | Player pressed fire. Server checks ammo and fire rate. |
| `weapon_reloaded` | Client, Controller | Server | `{}` | Player asked to reload the current weapon. |
| `weapon_switched` | Client, Controller | Server | `{ "slot": 2 }` | Player selected another weapon slot (1–3). |
| `loot_pickup_attempted` | Client, Controller | Server | `{ "lootId": "loot_42" }` | Player pressed "pick up" near an item. |
| `item_used` | Client, Controller | Server | `{ "item": "medkit" }` | Player used a consumable (`medkit`, `bandage`). |
| `controller_connected` | Controller | Server | `{ "deviceId": "esp32-01", "token": "abc123" }` | Hardware controller bound itself to a player session. |
| `ping_sent` | Client | Server | `{ "clientTime": 1731495600000 }` | Latency measurement. |
| `player_left` | Client | Server | `{}` | Player left the lobby/match on purpose. |

## 3. Events produced by Server

| Event | Producer | Consumer | Payload (`data`) | Description |
|-------|----------|----------|------------------|-------------|
| `player_welcomed` | Server | Owner (Client) | `{ "playerId": "p7", "token": "abc123", "serverTime": 1731495600000 }` | Reply to `player_joined`; player got an id and a token. |
| `lobby_updated` | Server | All in lobby | `{ "players": [{ "id": "p7", "name": "Anna", "character": "volt", "ready": true }], "countdown": 20 }` | Lobby content or countdown changed. |
| `match_started` | Server | All | `{ "matchId": "m15", "seed": 98213, "mapId": "arena_small", "players": [{ "id": "p7", "x": 120, "y": 900 }] }` | Countdown finished, match begins. |
| `state_updated` | Server | All | `{ "tick": 4521, "players": [{ "id": "p7", "x": 800.5, "y": 600.2, "angle": 1.2, "hp": 80 }], "bullets": [{ "id": "b3", "x": 700, "y": 500 }], "lastProcessedInput": 128 }` | Periodic world snapshot, 20×/s. |
| `shot_fired` | Server | All | `{ "shooterId": "p7", "weapon": "smg", "x": 800, "y": 600, "angle": 1.2 }` | Server accepted a shot (used for effects and sound). |
| `player_damaged` | Server | All (Owner also triggers rumble) | `{ "targetId": "p9", "attackerId": "p7", "damage": 8, "hpLeft": 72 }` | Bullet hit a player, or the Zone hurt them (`attackerId: "zone"`). |
| `player_eliminated` | Server | All | `{ "victimId": "p9", "killerId": "p7", "weapon": "smg", "placement": 5 }` | Player's HP reached 0; player becomes a spectator. |
| `weapon_reload_finished` | Server | Owner | `{ "weapon": "smg", "ammoInMag": 30, "ammoReserve": 60 }` | Reload completed. |
| `weapon_switch_confirmed` | Server | Owner | `{ "slot": 2, "weapon": "smg" }` | Weapon change accepted. |
| `loot_spawned` | Server | All | `{ "lootId": "loot_42", "type": "rifle", "x": 900, "y": 500 }` | New item placed on the map (at start or as a drop from an eliminated player). |
| `loot_picked_up` | Server | All | `{ "lootId": "loot_42", "playerId": "p7", "type": "rifle" }` | A player collected an item; it is removed from the map. |
| `inventory_updated` | Server | Owner | `{ "weapons": ["pistol", "smg"], "ammo": { "light": 60 }, "items": { "medkit": 1 }, "armor": 20 }` | Inventory changed (after pickup, use, reload, etc.). |
| `player_healed` | Server | All | `{ "playerId": "p7", "amount": 50, "hpNow": 100 }` | Medkit/bandage finished. |
| `zone_warned` | Server | All | `{ "phase": 2, "startsIn": 10, "nextRadius": 400 }` | Zone will shrink soon (countdown warning). |
| `zone_shrunk` | Server | All | `{ "phase": 2, "centerX": 800, "centerY": 600, "radius": 400, "damagePerSec": 3 }` | Safe zone started shrinking to a new radius. |
| `players_counted` | Server | All | `{ "alive": 4 }` | Number of players alive changed. |
| `match_ended` | Server | All | `{ "winnerId": "p7", "results": [{ "id": "p7", "placement": 1, "kills": 3, "score": 175 }] }` | Last player alive / time over. |
| `player_disconnected` | Server | All | `{ "playerId": "p9", "reconnectWindow": 10 }` | A connection was lost; character stays for 10 s. |
| `player_reconnected` | Server | All | `{ "playerId": "p9" }` | Player came back with the same token. |
| `controller_vibrated` | Server | Owner (Controller) | `{ "intensity": 0.8, "durationMs": 200 }` | Server asks the hardware controller to blink the hit LED / buzzer. |
| `pong_received` | Server | Owner (Client) | `{ "clientTime": 1731495600000, "serverTime": 1731495600020 }` | Reply to `ping_sent`. |
| `action_rejected` | Server | Owner | `{ "event": "loot_pickup_attempted", "code": "TOO_FAR", "message": "Item is out of reach" }` | Server refused a client event. |

### Error codes (`action_rejected`, `code`)

| Code | Meaning |
|------|---------|
| `LOBBY_FULL` | Match already has 8 players |
| `MATCH_IN_PROGRESS` | Cannot join a running match |
| `INVALID_TOKEN` | Reconnect token not recognized |
| `RATE_LIMITED` | More than 60 messages/s |
| `TOO_FAR` | Item/target out of range |
| `NO_AMMO` | Cannot fire/reload without ammo |
| `PLAYER_DEAD` | Dead players cannot act |

---

## 4. Example flow

```
Client/Controller                            Server
  | -- player_joined ---------------------->  |
  | <-- player_welcomed ---------------------  |
  | <-- lobby_updated -----------------------  |
  | -- player_readied --------------------->  |
  | <-- match_started -----------------------  |
  | -- player_moved (30 Hz) ----------------> |
  | <-- state_updated (20 Hz) ---------------  |
  | -- weapon_fired ------------------------> |
  | <-- shot_fired / player_damaged ---------  |
  | <-- controller_vibrated (to victim) -----  |
  | <-- zone_warned -> zone_shrunk ----------  |
  | <-- player_eliminated -------------------  |
  | <-- loot_spawned (drop) -----------------  |
  | -- loot_pickup_attempted ---------------> |
  | <-- loot_picked_up ----------------------  |
  | <-- match_ended -------------------------  |
```

## 5. Rules

- The server ignores events from dead or unknown players (`PLAYER_DEAD` / `action_rejected`).
- Clients never send position, HP, or damage; only intentions (move direction, aim, fire).
- Max 60 messages/s per client; max message size 2 KB.
- Snapshots (`state_updated`) are sent 20×/s; all other events only when something happens.
