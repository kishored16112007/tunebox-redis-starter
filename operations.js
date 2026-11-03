// operations.js — YOUR WORK GOES HERE.
//
// Implement the four Redis operations for the TuneBox music app.
// Fill in every `// TODO`. Do NOT change the function names or what they return
// — the test file depends on them. Each function is only a line or two.

import { redis } from "./redisClient.js";
import { findTrackInDB } from "./db.js";

// ─────────────────────────────────────────────────────────────────────────────
// Task 1 — Count track plays
// ─────────────────────────────────────────────────────────────────────────────
// Every time a track is played, add 1 to its play count.
export async function incrementPlays(trackId) {
  // TODO:
  //   Use INCR on the key `plays:${trackId}` and return the new count (a Number).
  //   Hint:  return await redis.incr(`plays:${trackId}`);
  return await redis.incr(`plays:${trackId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 2 — Read a track through the cache (cache-aside)
// ─────────────────────────────────────────────────────────────────────────────
// The database is slow. Check Redis first; only go to the DB if it is not cached.
export async function getTrack(trackId) {
  // TODO:
  //   1. const key = `track:${trackId}`;
  //   2. const cached = await redis.get(key);
  //        if (cached) return { source: "cache", track: JSON.parse(cached) };
  //   3. const track = await findTrackInDB(trackId);
  //        if (!track) return { source: "db", track: null };
  //   4. save it for next time with a 60-second expiry:
  //        await redis.set(key, JSON.stringify(track), "EX", 60);
  //      then return { source: "db", track };
  const key = `track:${trackId}`;
  const cached = await redis.get(key);
  if (cached) return { source: "cache", track: JSON.parse(cached) };
  const track = await findTrackInDB(trackId);
  if (!track) return { source: "db", track: null };
  await redis.set(key, JSON.stringify(track), "EX", 60);
  return { source: "db", track };
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 3 — Most-liked leaderboard (sorted set)
// ─────────────────────────────────────────────────────────────────────────────
// Track likes in a sorted set so we can read the most-liked tracks instantly.
export async function addLike(trackId) {
  // TODO:
  //   Add 1 to this track's score in the sorted set `trending:tracks`
  //   using ZINCRBY, and return the new score as a Number.
  //   Hint:  return Number(await redis.zincrby("trending:tracks", 1, trackId));
  return Number(await redis.zincrby("trending:tracks", 1, trackId));
}

export async function topTracks(n) {
  // TODO:
  //   Return the top n track ids, highest score first, as an array of ids.
  //   Hint:  return await redis.zrevrange("trending:tracks", 0, n - 1);
  return await redis.zrevrange("trending:tracks", 0, n - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 4 — One-time listen pass
// ─────────────────────────────────────────────────────────────────────────────
// A pass code can be used at most once.
export async function issuePass(code, ttlSeconds) {
  // TODO:
  //   Save the pass under `pass:${code}` with an expiry, in ONE atomic command:
  //     await redis.set(`pass:${code}`, "valid", "EX", ttlSeconds);
  //   Return the code.
  await redis.set(`pass:${code}`, "valid", "EX", ttlSeconds);
  return code;
}

export async function usePass(code) {
  // TODO:
  //   Read AND delete the pass in one step with GETDEL:
  //     const raw = await redis.getdel(`pass:${code}`);
  //   If raw exists → return { ok: true };
  //   Otherwise     → return { ok: false, reason: "invalid_or_used" };
  const raw = await redis.getdel(`pass:${code}`);
  if (raw) return { ok: true };
  return { ok: false, reason: "invalid_or_used" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 5 — Keep the cache honest (invalidation)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateTrackTitle(trackId, newTitle) {
  const db = await import("./db.js");
  if (typeof db.updateTitle === "function") {
    await db.updateTitle(trackId, newTitle);
  }
  return await redis.del(`track:${trackId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 6 — Who's listening right now
// ─────────────────────────────────────────────────────────────────────────────
export async function markListening(userId) {
  return await redis.sadd("listeners:online", userId);
}

export async function isListening(userId) {
  const res = await redis.sismember("listeners:online", userId);
  return res === 1;
}
