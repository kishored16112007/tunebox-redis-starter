// db.js — a pretend "slow" track database. GIVEN — do not edit.
// In a real app this would be PostgreSQL or MongoDB. Here it is just an object,
// with a tiny delay so you can feel why caching reads in Redis is worth it.

const TRACKS = {
  "1": { id: "1", title: "Sunrise Drive", artist: "Lena Fields" },
  "2": { id: "2", title: "Night Market", artist: "Kai Moto" },
  "3": { id: "3", title: "Paper Boats", artist: "The Willows" },
  "4": { id: "4", title: "Glass City", artist: "Ava Reyes" },
  "5": { id: "5", title: "Slow Tide", artist: "Marin" },
};

export async function findTrackInDB(trackId) {
  await new Promise((r) => setTimeout(r, 120)); // pretend the DB is slow
  return TRACKS[trackId] || null;
}
