import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import {
	buildExportConditions,
	countExportRows,
	EXPORT_BATCH_SIZE,
	EXPORT_CSV_HEADER,
	EXPORT_LOCK_TTL_SECONDS,
	MAX_EXPORT_ROWS,
	toCsvLine,
} from "@be/contacts/routes/contact/export-contacts/export-query";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { redis } from "@be/contacts/utils/loader";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, asc, gt } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function exportContactsController({
	organizationId,
	query,
}: {
	organizationId: string;
	query: ContactTypes.ContactExportQuery;
}): Promise<Response> {
	const log = useLogger();
	log.info("Exporting contacts", {
		...query,
		status: undefined,
		currentStatus: query.status,
	});

	const lockKey = `export:contacts:${organizationId}`;

	try {
		const baseConditions = buildExportConditions(organizationId, query);

		// Fast total for the X-Total-Count header + safety cap.
		const total = await countExportRows(organizationId, query);

		if (total === 0) {
			throw createError({
				status: 404,
				message: "No contacts to export",
				why: "No contacts match the current filters.",
				fix: "Adjust filters or add contacts before exporting.",
			});
		}

		if (total > MAX_EXPORT_ROWS) {
			throw createError({
				status: 413,
				message: "Export too large",
				why: `Matched ${total.toLocaleString()} contacts, limit is ${MAX_EXPORT_ROWS.toLocaleString()}.`,
				fix: "Narrow filters (status, channel, group, search) and export in smaller batches.",
			});
		}

		// Single-flight per org: prevents double-clicks / hammering from
		// spawning parallel full-table scans.
		const existingLock = await redis.get<number>(lockKey);
		if (existingLock !== undefined) {
			throw createError({
				status: 429,
				message: "Export already in progress",
				why: "Another contacts export is running for this organization.",
				fix: "Wait for it to finish before starting a new export.",
			});
		}
		await redis.set(lockKey, Date.now(), EXPORT_LOCK_TTL_SECONDS);

		const encoder = new TextEncoder();
		let released = false;
		const releaseLock = async () => {
			if (released) return;
			released = true;
			try {
				await redis.delete(lockKey);
			} catch {
				// best-effort; TTL expires the lock anyway
			}
		};

		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				try {
					controller.enqueue(encoder.encode(EXPORT_CSV_HEADER));

					let lastId: string | undefined;
					let exported = 0;

					while (exported < total) {
						const where = lastId
							? and(...baseConditions, gt(schema.contact.id, lastId))
							: and(...baseConditions);

						const batch = await db
							.select({
								id: schema.contact.id,
								email: schema.contact.email,
								firstName: schema.contact.firstName,
								lastName: schema.contact.lastName,
								status: schema.contact.status,
								createdAt: schema.contact.createdAt,
								updatedAt: schema.contact.updatedAt,
							})
							.from(schema.contact)
							.where(where)
							.orderBy(asc(schema.contact.id))
							.limit(EXPORT_BATCH_SIZE);

						if (batch.length === 0) break;

						let chunk = "";
						for (const row of batch) {
							chunk += `${toCsvLine(row)}\n`;
						}
						controller.enqueue(encoder.encode(chunk));

						exported += batch.length;
						lastId = batch[batch.length - 1]?.id;
						if (batch.length < EXPORT_BATCH_SIZE) break;
					}

					log.info("Contacts exported", { total, exported });
				} catch (error) {
					log.error("Error streaming contacts export", {
						error: error instanceof Error ? error.message : String(error),
					});
					controller.error(error);
				} finally {
					await releaseLock();
					try {
						controller.close();
					} catch {
						// already closed / errored
					}
				}
			},
			async cancel() {
				await releaseLock();
			},
		});

		const date = new Date().toISOString().split("T")[0];
		return new Response(stream, {
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="contacts_${date}.csv"`,
				"X-Total-Count": String(total),
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		if (isAppError(error)) {
			throw error;
		}
		log.error("Error exporting contacts", {
			error: error instanceof Error ? error.message : String(error),
		});
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
