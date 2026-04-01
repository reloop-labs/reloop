import "dotenv/config";
import { cleanupOldLogs } from "../src/utils/cleanup";

async function main() {
  const days = Number(process.argv[2]) || 100;
  console.log(`Starting manual cleanup of logs older than ${days} days...`);

  try {
    await cleanupOldLogs(days);
    console.log(`Cleanup command issued successfully for logs older than ${days} days.`);
    process.exit(0);
  } catch (error) {
    console.error("Manual cleanup failed:", error);
    process.exit(1);
  }
}

main();
