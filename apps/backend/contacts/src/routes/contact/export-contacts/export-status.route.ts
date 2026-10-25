import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { Elysia } from "elysia";
import { createError } from "evlog";
import {
	EXPORT_POLL_INTERVAL_SECONDS,
	readExportRecord,
} from "./export-record";

export const exportStatusRoute = new Elysia().use(authMiddleware).get(
	"/exports/:export_id",
	async ({ params: { export_id }, organizationId, set }) => {
		const record = await readExportRecord(export_id);
		// Another organization's job is reported as missing, not forbidden.
		if (!record || record.organizationId !== organizationId) {
			throw createError({
				status: 404,
				message: "Export not found",
				why: `No export job with ID "${export_id}" exists for your organization. Jobs are kept for 7 days.`,
				fix: "Use the exportId returned by Email Contacts Export, or request a new export.",
			});
		}
		const running =
			record.status === "queued" || record.status === "processing";
		if (running) {
			set.headers["retry-after"] = String(EXPORT_POLL_INTERVAL_SECONDS);
		}
		const response: ContactTypes.ContactExportJobResponse = {
			object: "contact_export",
			id: export_id,
			status: record.status,
			totalRows: record.totalRows,
			recipient: record.recipient,
			createdAt: record.createdAt,
			completedAt: record.completedAt ?? null,
		};
		return response;
	},
	{
		auth: true,
		params: ContactModel.contactExportJobParams,
		response: {
			200: ContactModel.contactExportJobResponse,
		},
		detail: {
			tags: ["Contact"],
			summary: "Get Export Status",
			description:
				"Returns the status of an emailed contacts export started with Email Contacts Export. Poll until `status` is `ready` (the download link was emailed) or `failed`. While the job runs the response includes `Retry-After` with the seconds to wait before polling again.",
		},
	},
);
