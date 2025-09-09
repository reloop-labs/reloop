import { db } from "@db";
import { redis } from "./redis";

export const loader = async () => {
	try {
		redis.on("error", (err) => {
			console.error("Redis Client Error:", err);
		});
		redis.on("connect", () => {
			console.log("Redis Client Connected");
		});
		redis.connect().catch(console.error);
		await db.execute("SELECT 1 as test");
		console.log("Postgres connected");
	} catch (e) {
		console.error(e);
	}
};
