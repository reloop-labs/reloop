import { upsertContactProperties } from "@be/contacts/routes/contact/utils/upsert-contact-properties";
import type { DatabaseInstance } from "@reloop/db/client";

export async function upsertProperties_step3({
	contactId,
	properties,
	organizationId,
	userId,
	db,
}: {
	contactId: string;
	properties?: Record<string, string | number>;
	organizationId: string;
	userId: string;
	db: DatabaseInstance;
}) {
	if (properties && Object.keys(properties).length > 0) {
		await upsertContactProperties({
			contactId,
			organizationId,
			userId,
			properties,
			db,
		});
	}
}
