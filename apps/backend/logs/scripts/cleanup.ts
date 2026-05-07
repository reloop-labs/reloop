import "dotenv/config";
import { cleanupOldLogs, truncateLogs } from "../src/utils/cleanup";

async function main() {
	const arg = process.argv[2];

	if (arg === "all") {
		console.log("Starting full cleanup of all logs (TRUNCATE)...");
		try {
			await truncateLogs();
			console.log("All logs have been successfully deleted.");
			process.exit(0);
		} catch (error) {
			console.error("Full cleanup failed:", error);
			process.exit(1);
		}
	}

	const days = Number(arg) || 100;
	console.log(`Starting manual cleanup of logs older than ${days} days...`);

	try {
		await cleanupOldLogs(days);
		console.log(
			`Cleanup command issued successfully for logs older than ${days} days.`,
		);
		process.exit(0);
	} catch (error) {
		console.error("Manual cleanup failed:", error);
		process.exit(1);
	}
}

main();
