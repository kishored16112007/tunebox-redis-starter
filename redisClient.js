// redisClient.js — the Redis connection. GIVEN — do not edit.
import "dotenv/config";
import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const redis = new Redis(url);
