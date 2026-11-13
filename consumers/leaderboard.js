// Leaderboard consumer (group team1.leaderboard).
// Rebuilds the table by replaying team1.match + team1.combat from the beginning (earliest).
import 'dotenv/config';
import http from 'http';

const B = process.env.BROKER_URL || 'https://edp-broker.codewithpeter.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.BROKER_USER || 'team1'}:${process.env.BROKER_PASSWORD}`).toString('base64');
const JSONH = { Authorization: AUTH, 'Content-Type': 'application/vnd.kafka.v2+json' };
const GROUP = 'team1.leaderboard', NAME = 'c1', base = `${B}/consumers/${GROUP}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const board = {}; // name -> { kills, wins }
const row = n => (board[n] ??= { kills: 0, wins: 0 });

// tiny HTTP endpoint: GET http://localhost:3001/leaderboard
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(Object.entries(board).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.wins - a.wins || b.kills - a.kills)));
}).listen(process.env.LEADERBOARD_PORT || 3001);

// create consumer + subscribe, retrying (first ~15 s the broker may answer 50003 network_exception)
async function setup() {
  for (let attempt = 1; ; attempt++) {
    try {
      let r = await fetch(base, { method: 'POST', headers: JSONH, body: JSON.stringify({ name: NAME, format: 'json', 'auto.offset.reset': 'earliest' }) });
      if (!r.ok && r.status !== 409) throw new Error(`create consumer: HTTP ${r.status} ${await r.text()}`);
      r = await fetch(`${base}/instances/${NAME}/subscription`, { method: 'POST', headers: JSONH, body: JSON.stringify({ topics: ['team1.match', 'team1.combat'] }) });
      if (!r.ok) throw new Error(`subscribe: HTTP ${r.status} ${await r.text()}`);
      return;
    } catch (e) {
      console.error(`setup attempt ${attempt} failed: ${e.message} - retrying in 3 s`);
      await sleep(3000);
    }
  }
}

function handle(v) {
  if (v.event === 'player_eliminated' && v.data.killerName) row(v.data.killerName).kills++;
  if (v.event === 'match_ended' && v.data.winnerName) row(v.data.winnerName).wins++;
  return v.event === 'match_ended';
}

await setup();
console.log('Leaderboard consumer started (replaying from the beginning)...');
let caughtUp = false;
for (;;) {
  try {
    const res = await fetch(`${base}/instances/${NAME}/records?timeout=1000`, { headers: { Authorization: AUTH, Accept: 'application/vnd.kafka.json.v2+json' } });
    const records = await res.json();
    if (!Array.isArray(records)) { console.error('poll error:', records); await sleep(2000); continue; }
    let matchEnded = false;
    for (const { value } of records) if (value && handle(value)) matchEnded = true;
    if (records.length === 0 && !caughtUp) { caughtUp = true; console.log('Caught up with the log. Current leaderboard:'); console.table(board); }
    else if (caughtUp && matchEnded) console.table(board);
  } catch (e) { console.error('poll failed:', e.message); await sleep(2000); }
  await sleep(200);
}
