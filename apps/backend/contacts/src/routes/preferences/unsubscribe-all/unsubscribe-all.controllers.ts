import { AuthErrors } from "@be/contacts/error/contacts.error-response";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";
import {
	unenrollAllChannels,
	unsubscribeMainList,
} from "../unsubscribe.helpers";

export async function unsubscribeAllController({ token }: { token: string }) {
	const log = useLogger();
	log.info("Processing unsubscribe all request");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	const main = await unsubscribeMainList({ contactId, organizationId });
	if (!main.found) {
		log.info("Unsubscribe-all for unknown contact (suppressed)");
		return { success: true, updatedCount: 0 };
	}

	const updatedCount = await unenrollAllChannels({
		contactId,
		organizationId,
	});

	log.info("Unsubscribed from main list and all channels", {
		contactId,
		updatedCount,
	});

	return {
		success: true,
		updatedCount,
	};
}
