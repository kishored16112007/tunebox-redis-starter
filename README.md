# TuneBox — Redis starter

A tiny music app. The connection, a pretend "slow" track database, and the tests
are already written. Your only job is to finish **four small functions** in
`operations.js` — each is a line or two.

## Setup

```bash
npm install
cp .env.example .env

# start Redis (either one):
redis-server
# or, with Docker:
docker run -d --name redis -p 6379:6379 redis

npm test
```

## What you edit

Only `operations.js` (look for every `// TODO`):

1. `incrementPlays` — `INCR` a play counter
2. `getTrack` — cache-aside read with a 60s TTL (`SET … EX 60`)
3. `addLike` + `topTracks` — a sorted-set leaderboard (`ZINCRBY`, `ZREVRANGE`)
4. `issuePass` + `usePass` — a one-time pass (`SET … EX`, `GETDEL`)

Do **not** edit `redisClient.js`, `db.js`, or `test.js`.

A correct solution ends with:

```
  RESULT: 13 passed, 0 failed
✓ All tests passed!
```
