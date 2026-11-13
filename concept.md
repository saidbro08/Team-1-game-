 2. concept.md
# LAST DROP — Game Concept Document

## 1. High-Level Concept

LAST DROP is a multiplayer Battle Royale survival game set on a dangerous abandoned industrial island.

The game supports up to 10 players competing against each other in a constantly shrinking playable area.

Players must collect weapons, ammunition, medical supplies and tactical equipment while avoiding the contaminated water that gradually covers the island.

The main objective is simple:

**Be the last player or team alive.**

The game combines:
- Survival mechanics.
- Tactical combat.
- Exploration.
- Resource management.
- Multiplayer competition.
- Dynamic environmental events.

### Game Tagline

"The water is rising. Make your last move count."

---

## 2. Game Story and Setting

The year is 2091.

A massive industrial accident occurred at Breakwater-9, an offshore research and energy facility.

A dangerous chemical substance leaked into the surrounding ocean, contaminating the island and forcing the evacuation of its population.

Several years later, a mysterious organisation called THE LAST NETWORK begins broadcasting illegal survival competitions from the abandoned island.

Contestants are transported to Breakwater-9 and forced to compete.

Their objective is to survive until the final extraction beacon activates.

Only one player or one team can win.

---

## 3. Game Modes

### 3.1 Solo Mode

- Every player competes individually.
- Maximum of 20 players.
- No teammates or revives.
- The last surviving player wins.

### 3.2 Duos Mode

- Players compete in teams of two.
- Maximum of 10 teams.
- Teammates can help each other.
- A downed teammate can be revived.
- The last surviving team wins.

For the initial prototype, Solo Mode will be implemented first. Duos Mode is planned as a later development milestone.

---

## 4. Match Structure

Each match consists of several stages.

### Stage 1 — Lobby

Players connect to the server and enter the multiplayer lobby.

They can:
- Select a game mode.
- View other players.
- Change their character appearance.
- Ready up.

The match begins when the required number of players is available.

### Stage 2 — Deployment

Players are transported to Breakwater-9.

Each player chooses a landing location.

Players initially have basic equipment and must search the island for better weapons.

### Stage 3 — Scavenging

Players explore buildings and abandoned facilities.

They can collect:
- Weapons.
- Ammunition.
- Medical supplies.
- Armour.
- Tactical equipment.

Some locations contain better loot but are more dangerous.

### Stage 4 — Combat

Players encounter opponents and must decide whether to fight or avoid confrontation.

Positioning, equipment and timing are important.

### Stage 5 — The Rising Tide

Contaminated water begins covering the island.

The safe zone gradually becomes smaller.

Players outside the safe zone receive damage over time.

### Stage 6 — Final Battle

The remaining players are forced into a small area.

The final confrontation determines the winner.

### Stage 7 — Results

The server calculates the final results.

Players receive:
- Final placement.
- Number of eliminations.
- Total damage dealt.
- Survival time.
- Match winner.

---

## 5. Game World — Breakwater-9

Breakwater-9 is a large abandoned industrial island surrounded by contaminated water.

The island contains seven main locations.

### 5.1 Central Reactor

A massive industrial reactor located near the centre of the island.

Features:
- High-value weapon loot.
- Multiple floors.
- Dangerous open areas.
- Several entrances.

Gameplay role: High-risk, high-reward location.

### 5.2 Rust Market

An abandoned marketplace made from shipping containers and metal structures.

Features:
- Narrow corridors.
- Small buildings.
- Close-range combat opportunities.
- Medium-level loot.

Gameplay role: Close-range combat and ambushes.

### 5.3 Flooded Village

A partially submerged residential area.

Features:
- Abandoned houses.
- Water-filled streets.
- Small hiding places.
- Multiple alternative routes.

Gameplay role: Stealth and tactical movement.

### 5.4 Signal Tower

A tall communications tower located on elevated terrain.

Features:
- Long-distance visibility.
- Limited cover.
- High-value equipment.
- Strategic positioning.

Gameplay role: Long-range combat and reconnaissance.

### 5.5 Dry Docks

An industrial shipyard containing cranes, warehouses and abandoned ships.

Features:
- Large open spaces.
- Multiple elevation levels.
- Industrial structures.
- Medium and high-level loot.

Gameplay role: Medium and long-range combat.

### 5.6 Research Block

A scientific research facility connected to the original accident.

Features:
- Laboratories.
- Medical equipment.
- Small corridors.
- Tactical supplies.

Gameplay role: Medical and utility equipment collection.

### 5.7 North Pier

A long pier containing abandoned containers and damaged boats.

Features:
- Limited cover.
- Open sightlines.
- Several loot containers.
- Dangerous escape routes.

Gameplay role: Strategic rotation and risky exploration.

---

## 6. Main Characters

Characters are cosmetic and do not provide gameplay advantages.

### Mara "Weld" Voss

Background: Former industrial engineer at Breakwater-9.

Appearance:
- Orange utility jacket.
- Mechanical equipment.
- Protective gloves.
- Industrial backpack.

Personality: Practical and resourceful.

### Ilan "Ghostline" Rhee

Background: Former communications technician.

Appearance:
- Dark tactical raincoat.
- Compact backpack.
- Communication headset.
- Lightweight equipment.

Personality: Quiet and strategic.

### Niko "Tidebreaker" Sato

Background: Former rescue diver.

Appearance:
- Blue rescue suit.
- Diving equipment.
- Protective helmet.
- Emergency flotation gear.

Personality: Brave and determined.

---

## 7. Weapons System

Players can find different weapons around the island.

### 7.1 Kite-9 Pistol

Category: Pistol.

Characteristics:
- Fast handling.
- Low damage.
- Useful during the early game.
- Effective at short distances.

### 7.2 Rivet AR

Category: Assault Rifle.

Characteristics:
- Balanced damage.
- Medium-range effectiveness.
- Moderate recoil.
- General-purpose weapon.

### 7.3 Breakshot

Category: Shotgun.

Characteristics:
- Extremely powerful at close range.
- Slow reload.
- High damage per shot.
- Weak at long distances.

### 7.4 Longwake

Category: Marksman Rifle.

Characteristics:
- High accuracy.
- Long-range effectiveness.
- Slow firing speed.
- Requires precise aiming.

### 7.5 Harbor SMG

Category: Submachine Gun.

Characteristics:
- High firing rate.
- Effective in close combat.
- Low accuracy at long distances.
- Fast handling.

---

## 8. Equipment and Items

### Medical Items

**Med Patch**
- Restores player health.
- Requires a short usage animation.

**Armour Plate**
- Restores a portion of armour.
- Reduces incoming damage according to the armour system.

### Tactical Equipment

**Smoke Canister**
- Creates a smoke cloud.
- Helps players escape or reposition.

**Pulse Scanner**
- Detects nearby movement indicators for a short period.
- Does not reveal exact player identities.

**Ammo Pack**
- Restores ammunition for compatible weapons.

---

## 9. Inventory System

Every player has a limited inventory.

The inventory contains:

- Weapon Slot 1.
- Weapon Slot 2.
- Ammunition.
- Healing Slot.
- Tactical Equipment Slot.

Players can:
- Collect items.
- Drop unwanted items.
- Change equipped weapons.
- Use healing items.
- Reload weapons.

The server controls the official inventory state to prevent item duplication and cheating.

---

## 10. Health and Armour System

Every player starts with:

- 100 Health Points.
- 0 Armour Points.

Armour can be collected during the match.

When a player receives damage, armour absorbs damage before health according to the configured damage rules.

When health reaches zero, the player is eliminated in Solo Mode.

In Duos Mode, players may enter a downed state before elimination.

---

## 11. The Rising Tide — Safe Zone System

The most important environmental mechanic is the contaminated water.

The island gradually becomes unplayable as the water rises.

Players must continuously move toward the safe zone.

### Match Phases

| Phase | Time | Description |
|---|---|---|
| Deployment | 0:00–0:45 | Players land on the island |
| Phase 1 | 0:45–3:00 | First zone is announced |
| Phase 2 | 3:00–6:00 | Safe area becomes smaller |
| Phase 3 | 6:00–9:00 | Water covers more locations |
| Final Phase | 9:00+ | Very small final safe zone |

### Zone Rules

- The server determines the safe zone.
- Players receive warnings before each closure.
- The zone is displayed on the minimap.
- Players outside the safe zone receive periodic damage.
- Zone damage increases during later phases.

---

## 12. Random In-Game Events

To make matches more interesting, LAST DROP includes random events.

### 12.1 Supply Drop

A supply aircraft releases a high-value equipment crate.

Possible rewards:
- Rare weapons.
- Armour.
- Ammunition.
- Medical supplies.

Players receive a notification about the drop location.

The supply crate creates an opportunity for combat.

### 12.2 Power Failure

The island temporarily loses electricity.

Effects:
- Some buildings become dark.
- Certain lights stop working.
- Visibility is reduced in selected areas.

Players must adapt to the temporary environment.

### 12.3 Emergency Bridge

A damaged bridge becomes temporarily available.

Players can use it to cross between two island sections.

The bridge may collapse after a limited time.

### 12.4 Toxic Storm

A dangerous storm temporarily reduces visibility.

Effects:
- Reduced visibility.
- Strong wind audio.
- Environmental warning indicators.
- Increased danger outside the safe zone.

### 12.5 Abandoned Security Vault

A previously locked storage room opens.

The vault contains valuable equipment.

Its location is announced to all players, creating a new objective.

---

## 13. User Interface

The main HUD includes:

- Health bar.
- Armour bar.
- Current weapon.
- Ammunition counter.
- Inventory.
- Safe zone indicator.
- Zone countdown.
- Remaining player count.
- Minimap.
- Kill feed.

### Main Menu

Options:
- Play.
- Settings.
- Character Selection.
- Credits.
- Exit.

### Lobby

Displays:
- Connected players.
- Selected game mode.
- Player readiness.
- Match countdown.

### Results Screen

Displays:
- Final placement.
- Winner.
- Eliminations.
- Damage dealt.
- Survival time.

---

## 14. Visual and Audio Design

### Visual Style

LAST DROP uses a stylised industrial science-fiction visual direction.

Main colours:
- Dark blue.
- Grey.
- Rust orange.
- Hazard yellow.
- Emergency red.

The environment should feel abandoned, dangerous and atmospheric.

### Sound Design

Important sounds include:
- Weapon firing.
- Reloading.
- Player footsteps.
- Water movement.
- Environmental alarms.
- Supply drop announcements.
- Zone closure warnings.
- Victory and defeat sounds.

---

## 15. Controls

| Action | Keyboard / Mouse |
|---|---|
| Move Forward | W |
| Move Backward | S |
| Move Left | A |
| Move Right | D |
| Jump | Space |
| Sprint | Shift |
| Crouch | Ctrl |
| Shoot | Left Mouse Button |
| Aim | Right Mouse Button |
| Reload | R |
| Interact | E |
| Use Healing | Q |
| Weapon Slot 1 | 1 |
| Weapon Slot 2 | 2 |
| Open Map | M |
| Pause | Esc |

Gamepad support is planned as an additional feature.

---

## 16. Win and Lose Conditions

### Victory

A player wins when all other players have been eliminated.

In Duos Mode, a team wins when all other teams have been eliminated.

### Defeat

A player loses when:
- Their health reaches zero.
- They are eliminated by another player.
- They fail to escape the contaminated zone.

---

## 17. MVP — Minimum Viable Product

The first playable version should contain:

1. Multiplayer connection.
2. Player lobby.
3. Character spawning.
4. Basic movement.
5. One playable map.
6. Three weapons.
7. Basic shooting and damage.
8. Loot collection.
9. Health system.
10. Shrinking safe zone.
11. Player elimination.
12. Match winner announcement.

Additional features such as Duos, supply drops and advanced environmental events can be added later.

---

## 18. Future Development

Possible future updates:

- New maps.
- New weapons.
- Additional characters.
- Ranked matchmaking.
- Spectator mode.
- More random events.
- Advanced movement mechanics.
- Customisation and cosmetic skins.
- Persistent player statistics.

---

## 19. Conclusion

LAST DROP aims to deliver a fast and competitive multiplayer Battle Royale experience.

The combination of industrial exploration, limited resources, tactical combat and the rising contaminated tide creates constant pressure and meaningful decisions.

The project is designed to begin as a realistic student multiplayer prototype and can later be expanded into a larger game.
