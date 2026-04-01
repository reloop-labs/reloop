import { getClickHouseClient } from "./clickhouse";

/**
 * Deletes logs older than the specified number of days.
 * @param days Retention period in days
 */
export async function cleanupOldLogs(days = 100): Promise<number> {
  const client = getClickHouseClient();

  try {
    // In ClickHouse, ALTER TABLE ... DELETE is asynchronous.
    // We use it to remove rows based on the timestamp.
    await client.exec({
      query: `
				ALTER TABLE logs
				DELETE WHERE created_at < subtractDays(now(), ${days})
			`,
    });

    // Since it's async, we don't get an immediate count of deleted rows easily
    // but the command has been issued.
    return days;
  } catch (error) {
    console.error(`Failed to cleanup logs older than ${days} days:`, error);
    throw error;
  }
}
