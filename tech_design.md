
# LAST DROP — Technical Design Document

## 1. Introduction

This document describes the technical architecture, technology stack, networking systems, controllers and development structure of LAST DROP, a multiplayer Battle Royale game.

The main objective is to create a stable multiplayer game where multiple players can connect to the same server, interact with the environment, collect weapons and compete against each other in real time.

## 2. Technology Stack

The following technologies are proposed for development:

| Component | Technology | Purpose |
|---|---|---|
| Game Engine | Godot 4.x | Game development |
| Programming Language | GDScript | Gameplay programming |
| Networking | Godot Multiplayer API | Multiplayer communication |
| Network Protocol | ENet | Client-server communication |
| Server | Dedicated Godot Server | Game state management |
| Version Control | Git | Source code management |
| Repository | GitHub | Team collaboration |
| 3D Modelling | Blender | Character and environment models |
| UI | Godot Control Nodes | Menus and HUD |

### Why Godot?

Godot is selected because it is free, open-source and suitable for multiplayer game development.

It provides built-in networking functionality, 3D rendering, physics and a flexible scripting system.

## 3. System Architecture

LAST DROP uses a Client-Server architecture.

The server is responsible for managing the official game state, while clients handle player input and visual presentation.

### Architecture Overview

```text
                 GAME SERVER
        +---------------------------+
        |       Match Manager       |
        +---------------------------+
        |       Player Manager      |
        +---------------------------+
        |       Combat Manager      |
        +---------------------------+
        |      Inventory Manager    |
        +---------------------------+
        |        Loot Manager       |
        +---------------------------+
        |        Zone Manager       |
        +---------------------------+
                   |
               ENet Network
                   |
        +----------+----------+
        |          |          |
     CLIENT 1   CLIENT 2   CLIENT 3
        |          |          |
     Controls   Controls   Controls
     Camera     Camera     Camera
     HUD        HUD        HUD
```

## 4. Server Responsibilities

The server acts as the authoritative source of game information.

Its main responsibilities include:

### Player Management
- Managing player connections.
- Assigning player IDs.
- Spawning players.
- Tracking player health.
- Managing eliminations.
- Handling disconnects.

### Combat Management
- Validating weapon usage.
- Checking ammunition.
- Calculating damage.
- Detecting hits.
- Managing firing rates.

### Inventory Management
- Managing inventory slots.
- Validating item ownership.
- Processing item pickups.
- Managing ammunition.
- Processing item usage.

### Match Management
- Managing the lobby.
- Starting match countdowns.
- Initializing matches.
- Tracking remaining players.
- Determining the winner.
- Generating match results.

### Zone Management
- Controlling the safe zone.
- Updating zone radius.
- Managing zone phases.
- Applying damage outside the safe area.

## 5. Client Responsibilities

Each client manages the player's local experience.

Client responsibilities include:

- Keyboard and mouse input.
- Character movement input.
- Camera control.
- Character animations.
- User interface.
- Weapon visual effects.
- Sound effects.
- Minimap.
- Inventory display.
- Visual representation of other players.

Clients send requests to the server, but they cannot independently decide official damage, inventory ownership or match results.

## 6. Multiplayer Communication

Godot Multiplayer API and ENet will be used for network communication.

### Communication Process

1. A player connects to the server.
2. The server creates a player session.
3. The client sends gameplay inputs and requests.
4. The server validates incoming requests.
5. The server updates the official game state.
6. The server broadcasts updates to connected clients.
7. Clients synchronize their local game representations.

### State Synchronization

The server controls:
- Player health and armour.
- Weapon ammunition.
- Inventory contents.
- Loot ownership.
- Safe zone position and radius.
- Match phase.
- Player elimination status.

Movement updates will use sequence numbers and interpolation to improve synchronization and reduce visible network delays.

Important events such as player elimination, inventory updates and match results will use reliable network communication.

## 7. Controllers and Input System

The initial version will support keyboard and mouse controls.

Godot Input Map will be used to configure player actions.

### Keyboard and Mouse Controls

| Action | Key |
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

### Gamepad Support

Gamepad support is planned using Godot Input Map.

| Action | Controller Input |
|---|---|
| Movement | Left Stick |
| Camera | Right Stick |
| Shoot | Right Trigger |
| Aim | Left Trigger |
| Jump | A / Cross |
| Reload | X / Square |
| Sprint | Left Stick Click |
| Crouch | Right Stick Click |
| Inventory | D-Pad |
| Pause | Menu Button |

### Steering Wheel Support

A steering wheel is not recommended because LAST DROP is an on-foot Battle Royale game.

A standard gamepad is more suitable for this project.

## 8. Project Structure

The proposed project structure is:

```text
LAST-DROP/
|
|-- README.md
|-- concept.md
|-- game_events.md
|-- tech_design.md
|-- .gitignore
|
|-- project/
    |
    |-- project.godot
    |
    |-- scenes/
    |   |-- MainMenu.tscn
    |   |-- Lobby.tscn
    |   |-- Match.tscn
    |   |-- Player.tscn
    |   |-- Weapon.tscn
    |   |-- LootPickup.tscn
    |
    |-- scripts/
    |   |
    |   |-- autoload/
    |   |   |-- NetworkManager.gd
    |   |   |-- GameConfig.gd
    |   |
    |   |-- server/
    |   |   |-- MatchManager.gd
    |   |   |-- PlayerManager.gd
    |   |   |-- CombatManager.gd
    |   |   |-- InventoryManager.gd
    |   |   |-- LootManager.gd
    |   |   |-- ZoneManager.gd
    |   |
    |   |-- client/
    |   |   |-- PlayerInput.gd
    |   |   |-- CameraController.gd
    |   |   |-- HUD.gd
    |   |   |-- MenuController.gd
    |   |
    |   |-- shared/
    |       |-- EventNames.gd
    |       |-- ItemData.gd
    |
    |-- assets/
    |   |-- models/
    |   |-- textures/
    |   |-- audio/
    |   |-- materials/
    |   |-- ui/
    |
    |-- tests/
```

## 9. Main Game Systems

### NetworkManager.gd

Responsible for:
- Creating the server.
- Connecting clients.
- Managing network sessions.
- Sending and receiving multiplayer events.
- Synchronizing connected players.

### MatchManager.gd

Responsible for:
- Lobby management.
- Match countdown.
- Starting matches.
- Tracking match phases.
- Determining the winner.
- Publishing final results.

### PlayerManager.gd

Responsible for:
- Creating player instances.
- Assigning player IDs.
- Spawning players.
- Tracking player status.
- Managing eliminations.

### CombatManager.gd

Responsible for:
- Weapon validation.
- Shooting mechanics.
- Hit detection.
- Damage calculation.
- Combat events.

### InventoryManager.gd

Responsible for:
- Inventory slots.
- Item ownership.
- Weapon switching.
- Ammunition management.
- Item usage.

### LootManager.gd

Responsible for:
- Spawning loot.
- Distributing items.
- Processing pickups.
- Preventing duplicate item collection.

### ZoneManager.gd

Responsible for:
- Safe zone creation.
- Zone shrinking.
- Zone movement.
- Environmental damage.
- Zone synchronization.

## 10. Data Management

Gameplay values will be stored in centralized configuration resources.

These values include:

- Maximum player count.
- Player health.
- Armour limits.
- Weapon damage.
- Weapon firing rates.
- Magazine capacity.
- Reload duration.
- Loot spawn probabilities.
- Zone phase durations.
- Zone damage values.

Centralized configuration makes balancing easier and allows the team to change gameplay parameters without modifying multiple scripts.

## 11. Security Considerations

The server must validate important gameplay actions to reduce cheating.

### Movement Validation
The server checks movement speed and rejects impossible position changes.

### Weapon Validation
The server verifies weapon ownership, ammunition availability and firing rate.

### Inventory Validation
The server checks item ownership and prevents duplicate pickups.

### Health Validation
Clients cannot directly modify their own health or armour.

### Match Validation
Only the server determines player elimination and the final winner.

### Network Protection
- Validate incoming event data.
- Limit excessive requests.
- Reject unauthorized actions.
- Handle disconnected clients.
- Avoid trusting client timestamps.

## 12. Testing Strategy

The following tests will be performed during development.

| Test | Expected Result |
|---|---|
| Two clients connect | Both appear in the lobby |
| Player becomes ready | Lobby state updates |
| Countdown finishes | Server starts the match |
| Player moves | Other clients see movement |
| Player collects weapon | Inventory updates |
| Two players request the same item | Only one receives it |
| Player fires without ammunition | Server rejects the shot |
| Player fires too quickly | Server rejects invalid firing |
| Player receives damage | Health updates correctly |
| Player enters toxic water | Server applies damage |
| Player is eliminated | Player cannot continue playing |
| One player remains | Server announces the winner |

## 13. Team Responsibilities

### Arlen Kaldaraliev
**Role: Lead Architect, Backend and Event Pipeline**

Responsibilities:
- Overall system architecture.
- Server-side event structure.
- Backend logic.
- Event documentation.
- Integration between gameplay systems.

### Dmytro Simonov
**Role: Gameplay Mechanics and State Synchronization**

Responsibilities:
- Gameplay systems.
- Combat mechanics.
- Player movement synchronization.
- Health and damage systems.
- Safe zone implementation.

### Saidinov Tariel
**Role: Frontend Rendering and UI/UX**

Responsibilities:
- Player controls.
- Camera system.
- User interface.
- HUD.
- Menus and visual feedback.
- Client-side presentation.

All team members should contribute to the GitHub repository through individual commits.

## 14. Development Roadmap

### Milestone 1 — Project Setup
- Create Godot project.
- Configure GitHub repository.
- Establish project structure.
- Configure Input Map.

### Milestone 2 — Multiplayer Foundation
- Create server.
- Connect multiple clients.
- Implement player sessions.
- Implement lobby.

### Milestone 3 — Player Systems
- Character movement.
- Camera system.
- Player spawning.
- Movement synchronization.

### Milestone 4 — Gameplay Systems
- Weapon system.
- Shooting mechanics.
- Damage system.
- Health system.
- Loot collection.
- Inventory.

### Milestone 5 — Battle Royale Systems
- Safe zone.
- Zone shrinking.
- Environmental damage.
- Player elimination.
- Winner determination.

### Milestone 6 — Interface and Polish
- HUD.
- Main menu.
- Lobby interface.
- Match results.
- Audio and visual effects.

### Milestone 7 — Testing and Demonstration
- Multiplayer testing.
- Bug fixing.
- Performance testing.
- Final demonstration.

## 15. Definition of Done

The technical design is ready for implementation when:

- The game architecture is agreed upon.
- The technology stack is selected.
- The event catalogue is documented.
- Controllers and keyboard inputs are defined.
- Server and client responsibilities are separated.
- Team responsibilities are assigned.
- Development milestones are established.

The first playable prototype will be considered successful when multiple clients can connect, participate in the same match, collect equipment, fight, survive the shrinking zone and receive synchronized match results.

## 16. Conclusion

The proposed architecture provides a foundation for developing LAST DROP as a multiplayer Battle Royale game.

The combination of Godot 4, GDScript, ENet and an authoritative server allows the team to implement the main multiplayer systems in manageable stages.

The modular architecture also makes it possible to introduce new weapons, maps, events and game modes in future development.

