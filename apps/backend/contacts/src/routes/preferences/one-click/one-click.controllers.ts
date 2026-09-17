import { AuthErrors } from "@be/contacts/error/contacts.error-response";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";
import {
	unenrollAllChannels,
	unsubscribeMainList,
} from "../unsubscribe.helpers";

/**
 * RFC 8058 one-click unsubscribe.
 *
 * Gmail/Yahoo POST to the `List-Unsubscribe` URL with body
 * `List-Unsubscribe=One-Click`. No auth — the signed token is the credential.
 * Always idempotent: already-unsubscribed contacts still return success.
 *
 * Matches the preference-center "unsubscribe all" action: main list plus
 * every channel enrollment.
 */
export async function oneClickUnsubscribeController({
	token,
}: {
	token: string;
}) {
	const log = useLogger();
	log.info("Processing one-click unsubscribe");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	const main = await unsubscribeMainList({ contactId, organizationId });
	// Token is opaque — don't reveal whether the contact exists.
	// Return success so providers don't retry a dead URL.
	if (!main.found) {
		log.info("One-click unsubscribe for unknown contact (suppressed)");
		return { success: true };
	}

	await unenrollAllChannels({ contactId, organizationId });

	log.info("One-click unsubscribe completed", { contactId });

	return { success: true };
}
