# LAST DROP — Game Events Documentation

## 1. Introduction

This document describes the events exchanged between the game clients and the multiplayer server.

LAST DROP uses a Client-Server architecture.

Players perform actions on their local clients, but the server validates important gameplay actions and updates the official game state.

The event system is responsible for:
- Player connections.
- Lobby management.
- Match initialization.
- Player movement.
- Weapon interactions.
- Inventory management.
- Combat and damage.
- Safe zone synchronization.
- Random game events.
- Player elimination.
- Match results.

## 2. Event Communication Model

There are two main communication directions.

### Client-to-Server (C -> S)

Events sent by a player to request an action.

Examples:
- Request to join a match.
- Request to collect an item.
- Request to fire a weapon.
- Request to reload.
- Request to use a medical item.

### Server-to-Client (S -> C)

Events sent by the server to inform clients about the official game state.

Examples:
- Player joined.
- Weapon collected.
- Player received damage.
- Safe zone changed.
- Player eliminated.
- Match ended.

The server is authoritative and makes the final decision about gameplay actions.

---

## 3. Standard Event Structure

Events follow a common JSON structure.

