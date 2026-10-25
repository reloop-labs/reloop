import { redis } from "@be/contacts/utils/loader";

/** Lifecycle of an emailed export job, polled via GET /v1/exports/:export_id. */
export type ExportJobStatus = "queued" | "processing" | "ready" | "failed";

export type ExportJobRecord = {
	organizationId: string;
	status: ExportJobStatus;
	totalRows: number;
	recipient: string;
	createdAt: string;
	completedAt?: string;
};

/** Kept for 7 days, matching the emailed link's validity. */
const EXPORT_RECORD_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Seconds clients should wait between status polls while the job runs. */
export const EXPORT_POLL_INTERVAL_SECONDS = 5;

const recordKey = (exportId: string) => `export:email:record:${exportId}`;

/** Public path of an export's status resource. */
export const exportStatusPath = (exportId: string) =>
	`/api/contacts/v1/exports/${exportId}`;

export async function readExportRecord(
	exportId: string,
): Promise<ExportJobRecord | undefined> {
	return redis.get<ExportJobRecord>(recordKey(exportId));
}

export async function writeExportRecord(
	exportId: string,
	record: ExportJobRecord,
): Promise<void> {
	await redis.set(recordKey(exportId), record, EXPORT_RECORD_TTL_SECONDS);
}

/** Moves a job to a new status, keeping its other fields. Best-effort. */
export async function updateExportRecord(
	exportId: string,
	update: Pick<ExportJobRecord, "status"> & Partial<ExportJobRecord>,
): Promise<void> {
	try {
		const current = await readExportRecord(exportId);
		if (!current) return;
		await writeExportRecord(exportId, { ...current, ...update });
	} catch {
		// The job's outcome is still emailed; a stale status only affects polling.
	}
}
