import { AuthErrors } from "@be/contacts/error/contacts.error-response";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";
import { unsubscribeMainList } from "../unsubscribe.helpers";

/**
 * Campaign unsubscribe: top-level list only.
 * Channel enrollments stay on the preference center.
 */
export async function unsubscribeController({ token }: { token: string }) {
	const log = useLogger();
	log.info("Processing main-list unsubscribe");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const result = await unsubscribeMainList({
		contactId: payload.contactId,
		organizationId: payload.organizationId,
	});

	// Token is opaque — don't reveal whether the contact exists.
	if (!result.found) {
		log.info("Main-list unsubscribe for unknown contact (suppressed)");
		return { success: true };
	}

	log.info("Main-list unsubscribe completed", {
		contactId: payload.contactId,
		changed: result.changed,
	});

	return { success: true };
}
