# Game Concept – Neon Zone Royale

## 1. Overview

**Neon Zone Royale** is a fast, top-down multiplayer battle royale. Every match lasts about 3 minutes, so it is easy to play in short sessions. The game runs in a browser; the server is authoritative (it decides everything important), so cheating is hard.

**Core loop:** land → loot → fight → run from the shrinking zone → survive.

## 2. Story / Setting

In 2087 the megacorporation *NeoCorp* runs illegal broadcast tournaments on abandoned artificial islands. Contestants are cyber-enhanced "runners" who fight for fame and a ticket out of the slums. The arena is a neon-lit island where a deadly energy field (**the Zone**) slowly collapses toward the center.

## 3. Characters

Each player picks one runner before the match. Characters differ only slightly (small passive bonus), to keep the game balanced.

| Character | Look | Passive ability |
|-----------|------|-----------------|
| **Volt** | Blue suit, lightning visor | +10% movement speed |
| **Rook** | Heavy orange armor | Starts with 120 HP instead of 100 |
| **Ghost** | Dark purple hoodie | Footsteps are quieter (smaller sound radius) |
| **Patch** | Green medic outfit | Heals 25% faster when using medkits |

Other characters:
- **Bots** – optional, fill empty slots for testing (simple AI: move, shoot, avoid the Zone).
- **Announcer "NEON-X"** – an AI voice/text that comments on kills and zone phases.

## 4. Game rules

1. Lobby: **2–8 players** join; when ≥ 2 players are ready (or 30 s timer ends) the match starts.
2. Players spawn at random points on the island edge, unarmed (only a pistol with limited ammo).
3. Loot crates and floor items spawn across the map. Players collect weapons, ammo, armor, and medkits.
4. The **Zone** shrinks in phases. Players outside the Zone lose HP every second (damage grows each phase).
5. A player with 0 HP is eliminated and becomes a spectator.
6. The last player alive wins. Ranking is based on placement, then kills.

### Zone phases

| Phase | Start time | Zone radius | Damage/sec outside |
|-------|-----------|-------------|--------------------|
| 1 | 0:20 | 100% → 60% | 2 |
| 2 | 1:00 | 60% → 30% | 4 |
| 3 | 1:50 | 30% → 5% | 8 |

Before each shrink the server sends `zone_warned` (10 s warning), then `zone_shrunk`.

## 5. Items

**Weapons**

| Weapon | Damage | Fire rate | Range | Ammo type |
|--------|--------|-----------|-------|-----------|
| Pistol (default) | 12 | medium | medium | light |
| SMG | 8 | very fast | short | light |
| Rifle | 20 | medium | long | heavy |

**Consumables / equipment**

- **Medkit** – heals 50 HP over 3 s.
- **Bandage** – heals 15 HP instantly.
- **Armor** – absorbs 30% of damage until destroyed.
- **Ammo boxes** – light / heavy.

## 6. Map

**One small map** (`arena_small`, 1600 × 1200 units, single screen-sized arena with a camera that follows the player). It is a neon industrial yard:

- **Center plaza** – open area, best loot, high risk.
- **Containers** (left/right) – cover and corridors.
- **Bushes** (corners) – hide players unless someone is very close.

Obstacles are static rectangles (walls, containers), so collision is simple. 8 spawn points are placed around the edge.

## 7. Scenarios

**Scenario A – Typical match**
1. Anna, Bartek and 3 others join the lobby and press READY.
2. Match starts; Anna lands near the Docks, finds an SMG and armor.
3. Phase 1 starts – the Zone shrinks; Anna moves toward the center.
4. She meets Bartek, wins the duel, and loots his shotgun.
5. In phase 3 only 2 players remain; Anna uses a medkit behind a container.
6. Final duel in the Zone center – Anna wins. Results screen shows placement and kills.

**Scenario B – Disconnection**
A player's connection drops (`player_disconnected`). The server keeps the character for 10 s (standing still, vulnerable). If the player reconnects with the same token (`player_reconnected`), control returns; otherwise the character is eliminated (`player_eliminated`).

**Scenario C – Controller play (hardware)**
A player connects the ESP32 + PSX controller (simulated in Wokwi). The left stick moves, the right stick aims, R1 fires, and the controller vibrates (virtual LED blink in Wokwi) when the player is hit.

## 8. Controls

| Action | Keyboard + mouse | PSX controller |
|--------|------------------|----------------|
| Move | W A S D | Left stick |
| Aim | Mouse | Right stick |
| Shoot | Left mouse | R1 |
| Reload | R | Square |
| Pick up / interact | E | Cross (X) |
| Use medkit | Q | Triangle |
| Switch weapon | 1–3 / wheel | L1 |
| Sprint | Shift | L3 (press stick) |

## 9. UI

- **HUD:** health bar, shield bar, ammo, current weapon, players alive, kills, mini-map with Zone circle.
- **Lobby screen:** player list, character selection, READY button.
- **Results screen:** placement, kills, damage dealt, leaderboard.

## 10. Win conditions and scoring

- Winner: last player alive.
- Score = (players beaten × 10) + (kills × 25) + (win bonus 100).
- Global leaderboard stored on the server (top 10).

## 11. Future ideas

Squad mode (teams of 2), more maps, vehicles (steering-wheel controller), cosmetic skins.
