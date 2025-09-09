import { db } from "../client";

export async function checkHealth() {
	await db.execute("SELECT 1 as test");
}
