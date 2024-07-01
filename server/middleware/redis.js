import { redis } from "../index.js";

export const getCachedData = (key) => async (req, res, next) => {
  let data = await redis.get(key);
  if (data) {
    return res.json({
      products: JSON.parse(data),
    });
  }
  next();
};
getCachedData();

export const rateLimiter = ({ limit=10, timer=20, key }) => async (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // gives the IP address
    const fullKey = `${clientIp}:${key}:request_count`;

    // Increment the request count for the IP address
    const reqCount = await redis.incr(fullKey);

    // Set the expiration timer on the first request
    if (reqCount === 1) {
        await redis.expire(fullKey, timer);
    }

    const timeRemaining = await redis.ttl(fullKey);

    // If the request count exceeds the limit, return a 429 status code
    if (reqCount > limit) {
        return res
            .status(429)
            .send(`Too many requests, please try again after ${timeRemaining} seconds`);
    }

    next();
};
