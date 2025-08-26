import { db } from "./db/pg";
import { redis } from "./db/redis";

export const loader = async () => {
	try {
		console.log("Connecting to Redis");
		await redis.connect();
		console.log("Redis connected");
		console.log("Connecting to Postgres");
		await db.execute("SELECT 1 as test");
		console.log("Postgres connected");
	} catch (e) {
		console.error(e);
	}
};
