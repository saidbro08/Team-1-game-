import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const W = 1600, H = 1200, TICK = 60, SNAP_EVERY = 3, MAX_PLAYERS = 8, MAX_MSG_PER_SEC = 60;
const SPEED = 220, BULLET_SPEED = 700, BULLET_DMG = 12, COOLDOWN = 0.25, R = 14;
const SHRINK_TIME = 20;
const PHASES = [{ at: 20, to: 450, dps: 2 }, { at: 60, to: 220, dps: 4 }, { at: 110, to: 40, dps: 8 }];

// =====================================================================
// Event publisher: queue + batching (one request at a time, many records per request)
// =====================================================================
const BROKER = process.env.BROKER_URL || 'https://edp-broker.codewithpeter.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.BROKER_USER || 'team1'}:${process.env.BROKER_PASSWORD}`).toString('base64');
const queue = [];
let flushing = false;

function enqueue(topic, event, data) {
  if (!process.env.BROKER_PASSWORD) return; // broker is optional in local dev
  const matchId = match?.id ?? 'lobby';
  queue.push({ topic, key: matchId, value: { event, ts: Date.now(), matchId, data } });
  if (queue.length > 5000) queue.splice(0, queue.length - 5000); // protect memory if broker is down
}

async function flush() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, queue.length);
  const byTopic = {};
  for (const r of batch) (byTopic[r.topic] ??= []).push({ key: r.key, value: r.value });
  const failed = [];
  for (const [topic, records] of Object.entries(byTopic)) {
    try {
      const res = await fetch(`${BROKER}/topics/${topic}`, {
        method: 'POST',
        headers: { Authorization: AUTH, 'Content-Type': 'application/vnd.kafka.json.v2+json' },
        body: JSON.stringify({ records }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch (e) {
      console.error(`broker publish to ${topic} failed (${e.message}), will retry`);
      failed.push(...records.map(r => ({ topic, ...r })));
    }
  }
  queue.unshift(...failed);
  flushing = false;
}
setInterval(flush, 200);

// =====================================================================
// Gateway state
// =====================================================================
const players = new Map();
let nextId = 1, match = null;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync(path.join(dir, '../client/index.html')));
});
const wss = new WebSocketServer({ server });

function send(ws, event, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify({ event, ts: Date.now(), data }));
}
function broadcast(event, data) { for (const p of players.values()) send(p.ws, event, data); }
// domain event: sent to the clients (WebSocket) AND queued for the broker topic
function emit(topic, event, data) { broadcast(event, data); enqueue(topic, event, data); }

const alive = () => [...players.values()].filter(p => p.alive);
const lobbyUpdate = () => broadcast('lobby_updated', {
  players: [...players.values()].map(p => ({ id: p.id, name: p.name, ready: p.ready })),
});

// =====================================================================
// Match lifecycle
// =====================================================================
function tryStart() {
  const list = [...players.values()];
  if (match || list.length < 2 || !list.every(p => p.ready)) return;
  match = { id: 'm' + Date.now(), t: 0, tick: 0, bullets: [], nb: 0, phase: 0,
    zone: { cx: W / 2, cy: H / 2, r: 700, dps: 0 }, from: 700, to: 700, shrinkStart: -1 };
  list.forEach((p, i) => {
    const a = (i / list.length) * Math.PI * 2;
    Object.assign(p, { x: W / 2 + Math.cos(a) * 500, y: H / 2 + Math.sin(a) * 500,
      hp: 100, alive: true, kills: 0, dx: 0, dy: 0, zoneAcc: 0, lastShot: -1 });
  });
  emit('team1.match', 'match_started', { matchId: match.id, mapId: 'arena_small',
    players: list.map(p => ({ id: p.id, name: p.name, x: p.x, y: p.y })) });
}

function damage(target, attacker, amount) {
  if (!target.alive) return;
  target.hp = Math.max(0, target.hp - amount);
  emit('team1.combat', 'player_damaged', {
    targetId: target.id, targetName: target.name,
    attackerId: attacker?.id ?? 'zone', attackerName: attacker?.name ?? 'zone',
    damage: amount, hpLeft: target.hp });
  if (target.hp <= 0) eliminate(target, attacker);
}

function eliminate(p, killer) {
  p.alive = false;
  if (killer) killer.kills++;
  emit('team1.combat', 'player_eliminated', {
    victimId: p.id, victimName: p.name,
    killerId: killer?.id ?? null, killerName: killer?.name ?? null,
    placement: alive().length + 1 });
  if (match && alive().length <= 1) endMatch();
}

function endMatch() {
  const winner = alive()[0];
  const results = [...players.values()].map(p => ({ id: p.id, name: p.name, kills: p.kills,
    score: p.kills * 25 + (p.alive ? 100 : 0) }));
  emit('team1.match', 'match_ended', { winnerId: winner?.id ?? null, winnerName: winner?.name ?? null, results });
  match = null;
  setTimeout(() => { players.forEach(p => { p.ready = false; p.alive = false; }); lobbyUpdate(); }, 5000);
}

// =====================================================================
// Game loop (simulation)
// =====================================================================
function tick() {
  if (!match) return;
  const dt = 1 / TICK;
  match.t += dt; match.tick++;
  const z = match.zone;

  const ph = PHASES[match.phase];
  if (ph && match.t >= ph.at) {
    match.phase++; match.from = z.r; match.to = ph.to; match.shrinkStart = match.t; z.dps = ph.dps;
    emit('team1.match', 'zone_shrunk', { phase: match.phase, centerX: z.cx, centerY: z.cy, radius: ph.to, damagePerSec: ph.dps });
  }
  if (match.shrinkStart >= 0) {
    const k = Math.min(1, (match.t - match.shrinkStart) / SHRINK_TIME);
    z.r = match.from + (match.to - match.from) * k;
  }

  for (const p of alive()) {
    const len = Math.hypot(p.dx, p.dy);
    if (len > 0) {
      p.x = Math.min(W - R, Math.max(R, p.x + (p.dx / len) * SPEED * dt));
      p.y = Math.min(H - R, Math.max(R, p.y + (p.dy / len) * SPEED * dt));
    }
    p.zoneAcc += dt;
    if (p.zoneAcc >= 1) {
      p.zoneAcc -= 1;
      if (z.dps > 0 && Math.hypot(p.x - z.cx, p.y - z.cy) > z.r) damage(p, null, z.dps);
    }
  }
  if (!match) return;

  match.bullets = match.bullets.filter(b => {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > W || b.y > H) return false;
    for (const p of alive()) {
      if (p.id !== b.owner.id && Math.hypot(p.x - b.x, p.y - b.y) < R + 3) { damage(p, b.owner, BULLET_DMG); return false; }
    }
    return true;
  });
  if (!match) return;

  // real-time state goes ONLY over WebSocket, never through the broker
  if (match.tick % SNAP_EVERY === 0) {
    broadcast('state_updated', {
      tick: match.tick, alive: alive().length,
      players: [...players.values()].map(p => ({ id: p.id, name: p.name, x: p.x, y: p.y, angle: p.angle ?? 0, hp: p.hp, alive: p.alive })),
      bullets: match.bullets.map(b => ({ id: b.id, x: b.x, y: b.y })),
      zone: { cx: z.cx, cy: z.cy, r: z.r },
    });
  }
}
setInterval(tick, 1000 / TICK);

// =====================================================================
// Commands from clients / controllers
// =====================================================================
wss.on('connection', ws => {
  let p = null, count = 0;
  const limiter = setInterval(() => { count = 0; }, 1000);

  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const d = m.data || {};
    const reject = (code, message) => send(ws, 'command_rejected', { command: m.command, code, message });
    if (++count > MAX_MSG_PER_SEC) return reject('RATE_LIMITED', 'Too many messages');

    switch (m.command) {
      case 'ping':
        return send(ws, 'pong', { clientTime: d.clientTime, serverTime: Date.now() });

      case 'join_game':
        if (p) return;
        if (match) return reject('MATCH_IN_PROGRESS', 'Match already running');
        if (players.size >= MAX_PLAYERS) return reject('LOBBY_FULL', 'Lobby is full');
        p = { id: 'p' + nextId++, ws, name: String(d.name || 'player').slice(0, 16), ready: false, alive: false, kills: 0 };
        players.set(p.id, p);
        send(ws, 'player_welcomed', { playerId: p.id });
        emit('team1.match', 'player_joined', { playerId: p.id, name: p.name });
        return lobbyUpdate();

      case 'leave_game':
        return ws.close();
    }

    if (!p) return;
    if (m.command === 'set_ready') {
      if (match) return;
      p.ready = !!d.ready;
      emit('team1.match', 'player_ready_changed', { playerId: p.id, name: p.name, ready: p.ready });
      lobbyUpdate(); tryStart();
      return;
    }
    if (!match) return;
    if (!p.alive) return reject('PLAYER_DEAD', 'Dead players cannot act');

    if (m.command === 'move') { p.dx = Math.max(-1, Math.min(1, +d.dx || 0)); p.dy = Math.max(-1, Math.min(1, +d.dy || 0)); }
    else if (m.command === 'aim') p.angle = +d.angle || 0;
    else if (m.command === 'fire_weapon') {
      if (match.t - p.lastShot < COOLDOWN) return;
      p.lastShot = match.t; p.angle = +d.angle || 0;
      match.bullets.push({ id: 'b' + match.nb++, owner: p, x: p.x + Math.cos(p.angle) * R, y: p.y + Math.sin(p.angle) * R,
        vx: Math.cos(p.angle) * BULLET_SPEED, vy: Math.sin(p.angle) * BULLET_SPEED, life: 1.2 });
      emit('team1.combat', 'weapon_fired', { shooterId: p.id, shooterName: p.name, weapon: 'pistol', x: p.x, y: p.y, angle: p.angle });
    }
  });

  ws.on('close', () => {
    clearInterval(limiter);
    if (!p) return;
    emit('team1.match', 'player_left', { playerId: p.id, name: p.name, reason: 'disconnect' });
    if (match && p.alive) eliminate(p, null);
    players.delete(p.id);
    lobbyUpdate();
  });
});

server.listen(PORT, () => console.log(`Neon Zone Royale gateway on http://localhost:${PORT}`));
