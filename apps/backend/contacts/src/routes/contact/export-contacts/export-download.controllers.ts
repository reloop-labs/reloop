import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import {
	downloadExportCsv,
	exportFileKey,
} from "@be/contacts/lib/export-storage";
import { verifyExportDownloadToken } from "@be/contacts/routes/contact/export-contacts/export-token.utils";
import { createError } from "evlog";

/**
 * Public (token-authed) download for emailed exports.
 * The HMAC token binds exportId + organizationId + 7-day expiry, so the
 * link works from an email client with no session cookie.
 */
export async function exportDownloadController({
	token,
}: {
	token: string;
}): Promise<Response> {
	try {
		const payload = await verifyExportDownloadToken(token);
		if (!payload) {
			throw createError({
				status: 410,
				message: "Download link expired or invalid",
				why: "The signature did not verify, or the 7-day validity window has passed.",
				fix: "Request a fresh export from the contacts page to get a new link.",
			});
		}

		const key = exportFileKey(payload.organizationId, payload.exportId);
		let bytes: Uint8Array;
		try {
			bytes = await downloadExportCsv(key);
		} catch {
			throw createError({
				status: 410,
				message: "Export file no longer available",
				why: "The file has expired and been cleaned up, or was never generated.",
				fix: "Request a fresh export from the contacts page.",
			});
		}

		const date = new Date().toISOString().split("T")[0];
		return new Response(bytes as BodyInit, {
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="contacts_${date}.csv"`,
				"Cache-Control": "private, max-age=3600",
			},
		});
	} catch (error) {
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
