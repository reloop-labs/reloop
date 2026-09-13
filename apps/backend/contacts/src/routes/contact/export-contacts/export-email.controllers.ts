import { contactsConfig } from "@be/contacts/contacts.config";
import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import {
	exportFileKey,
	uploadExportCsv,
} from "@be/contacts/lib/export-storage";
import {
	buildExportConditions,
	countExportRows,
	EXPORT_BATCH_SIZE,
	EXPORT_CSV_HEADER,
	MAX_EXPORT_ROWS,
	toCsvLine,
} from "@be/contacts/routes/contact/export-contacts/export-query";
import { signExportDownloadToken } from "@be/contacts/routes/contact/export-contacts/export-token.utils";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { redis } from "@be/contacts/utils/loader";
import { createId } from "@paralleldrive/cuid2";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";
import { createError, log } from "evlog";
import { useLogger } from "evlog/elysia";

/** How long an emailed-export generation may hold the per-org lock. */
const EMAIL_EXPORT_LOCK_TTL_SECONDS = 1800;
/** Redis record TTL for the export job (matches 7-day link validity). */
const EXPORT_RECORD_TTL_SECONDS = 7 * 24 * 60 * 60;

function emailLockKey(organizationId: string): string {
	return `export:email:${organizationId}`;
}

function exportRecordKey(exportId: string): string {
	return `export:email:record:${exportId}`;
}

async function resolveRecipientEmail(userId: string): Promise<string> {
	const rows = await db
		.select({ email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, userId))
		.limit(1);
	const email = rows[0]?.email;
	if (!email) {
		throw createError({
			status: 400,
			message: "Cannot determine recipient",
			why: "No email address is associated with the requesting user.",
			fix: "Ensure your account has a verified email, then retry.",
		});
	}
	return email;
}

async function processExportEmail(args: {
	exportId: string;
	organizationId: string;
	recipient: string;
	query: ContactTypes.ContactExportQuery;
	total: number;
}): Promise<void> {
	const { exportId, organizationId, recipient, query, total } = args;
	const lockKey = emailLockKey(organizationId);
	const recordKey = exportRecordKey(exportId);

	try {
		const baseConditions = buildExportConditions(organizationId, query);
		const parts: string[] = [EXPORT_CSV_HEADER];

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

			for (const row of batch) {
				parts.push(`${toCsvLine(row)}\n`);
			}
			exported += batch.length;
			lastId = batch[batch.length - 1]?.id;
			if (batch.length < EXPORT_BATCH_SIZE) break;
		}

		const key = exportFileKey(organizationId, exportId);
		await uploadExportCsv(key, parts.join(""));

		const { token, expiresAt } = await signExportDownloadToken({
			exportId,
			organizationId,
		});
		const downloadUrl = `${contactsConfig.BASE_URL}/api/contacts/export/download?token=${token}`;
		const date = new Date().toISOString().split("T")[0];
		const fileName = `contacts_${date}.csv`;

		await bus.publish(BusEvent.CONTACT_EXPORT_READY, {
			organizationId,
			to: recipient,
			exportId,
			downloadUrl,
			totalRows: exported,
			fileName,
			expiresAt: new Date(expiresAt).toISOString(),
		});

		await redis.set(
			recordKey,
			{ status: "ready", totalRows: exported, recipient },
			EXPORT_RECORD_TTL_SECONDS,
		);
		log.info({
			message: "Contact export emailed",
			exportId,
			organizationId,
			totalRows: exported,
		});
	} catch (error) {
		log.error({
			message: "Contact export email job failed",
			error: error instanceof Error ? error.message : String(error),
			exportId,
			organizationId,
		});
		try {
			await redis.set(
				recordKey,
				{ status: "failed" },
				EXPORT_RECORD_TTL_SECONDS,
			);
		} catch {
			// best-effort
		}
	} finally {
		try {
			await redis.delete(lockKey);
		} catch {
			// TTL expires the lock anyway
		}
	}
}

export async function requestExportEmailController({
	organizationId,
	userId,
	query,
}: {
	organizationId: string;
	userId: string;
	query: ContactTypes.ContactExportQuery;
}): Promise<{ exportId: string; totalRows: number; recipient: string }> {
	const requestLog = useLogger();
	requestLog.info("Export email requested", {
		...query,
		status: undefined,
		currentStatus: query.status,
	});

	try {
		const recipient = await resolveRecipientEmail(userId);
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

		// Single-flight per org: one emailed export generating at a time.
		const lockKey = emailLockKey(organizationId);
		const existingLock = await redis.get<number>(lockKey);
		if (existingLock !== undefined && contactsConfig.NODE_ENV !== "development") {
			throw createError({
				status: 429,
				message: "Export email already in progress",
				why: "Another emailed export is being generated for this organization.",
				fix: "Wait for its email to arrive before requesting another.",
			});
		}
		await redis.set(lockKey, Date.now(), EMAIL_EXPORT_LOCK_TTL_SECONDS);

		const exportId = `exp_${createId()}`;
		await redis.set(
			exportRecordKey(exportId),
			{ status: "queued", totalRows: total, recipient },
			EXPORT_RECORD_TTL_SECONDS,
		);

		// Fire-and-forget: the request returns 202 while CSV generation,
		// S3 upload, and the email send happen in the background.
		void processExportEmail({
			exportId,
			organizationId,
			recipient,
			query,
			total,
		}).catch((error) => {
			log.error({
				message: "Unhandled contact export email failure",
				error: error instanceof Error ? error.message : String(error),
				exportId,
			});
		});

		return { exportId, totalRows: total, recipient };
	} catch (error) {
		if (isAppError(error)) {
			throw error;
		}
		requestLog.error("Error requesting export email", {
			error: error instanceof Error ? error.message : String(error),
		});
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
