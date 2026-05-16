import { log } from "evlog";
import { type DatabaseInstance, db as defaultDb } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { and, eq, isNull } from "drizzle-orm";

export async function getExistingContact({
	email,
	organizationId,
	logger,
	db = defaultDb,
}: {
	email: string;
	organizationId: string;
	logger?: any;
	db?: DatabaseInstance;
}) {
	log.info({ ...({}), message: "Checking for existing contact" });
	const results = await db
		.select()
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.email, email),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		)
		.limit(1);
	return results[0] || null;
}
