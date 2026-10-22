// test.js — runs your four functions and prints PASS / FAIL. GIVEN — do not edit.
import { redis } from "./redisClient.js";
import {
  incrementPlays,
  getTrack,
  addLike,
  topTracks,
  issuePass,
  usePass,
} from "./operations.js";

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("  PASS  " + name); }
  else { failed++; console.log("  FAIL  " + name); }
}

async function clean() {
  await redis.del(
    "plays:1",
    "track:1",
    "track:999",
    "trending:tracks",
    "pass:GOLD",
  );
}

async function main() {
  await clean();

  console.log("\nTask 1 — Count track plays (INCR)");
  const p1 = await incrementPlays("1");
  const p2 = await incrementPlays("1");
  console.log("  plays after two increments:", p2);
  check("first play returns 1", p1 === 1);
  check("second play returns 2", p2 === 2);
  check("the count is a Number", typeof p2 === "number");

  console.log("\nTask 2 — Read a track through the cache (cache-aside + TTL)");
  const r1 = await getTrack("1");
  const r2 = await getTrack("1");
  const rMissing = await getTrack("999");
  const ttl = await redis.ttl("track:1");
  console.log("  first read source:", r1?.source, "| second read source:", r2?.source);
  check("first read comes from the DB", r1?.source === "db");
  check("first read returns the track", r1?.track?.title === "Sunrise Drive");
  check("second read comes from the cache", r2?.source === "cache");
  check("unknown track returns null track", rMissing?.track === null);
  check("cached track has a TTL between 1 and 60s", ttl > 0 && ttl <= 60);

  console.log("\nTask 3 — Most-liked leaderboard (sorted set)");
  await addLike("1");
  await addLike("2");
  await addLike("2");
  await addLike("2");
  await addLike("3");
  const s = await addLike("2"); // track 2 now has 4
  const top2 = await topTracks(2);
  console.log("  top 2:", JSON.stringify(top2));
  check("addLike returns the new score as a Number", s === 4);
  check("topTracks returns an array of ids", Array.isArray(top2) && top2.length === 2);
  check("track 2 is ranked #1 (most likes)", top2[0] === "2");

  console.log("\nTask 4 — One-time listen pass (SET EX + GETDEL)");
  await issuePass("GOLD", 60);
  const first = await usePass("GOLD");
  const second = await usePass("GOLD");
  console.log("  first use:", JSON.stringify(first), "| second use:", JSON.stringify(second));
  check("first use succeeds", first?.ok === true);
  check("second use fails (single-use)", second?.ok === false);

  console.log("\n" + "─".repeat(40));
  console.log(`  RESULT: ${passed} passed, ${failed} failed`);
  console.log("─".repeat(40));
  await redis.quit();
  if (failed === 0) console.log("✓ All tests passed!");
  else process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
