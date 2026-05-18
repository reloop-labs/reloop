import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function updateStatusToVerifying_step2({
	domainId,
}: {
	domainId: string;
}) {
	const log = useLogger();

	// Set status to "verifying"
	log.info("Updating domain status to verifying");
	await db
		.update(schema.domain)
		.set({ status: "verifying" })
		.where(eq(schema.domain.id, domainId));

	log.info("Updating DNS records status to verifying");
	await db
		.update(schema.domainDnsRecord)
		.set({ status: "verifying" })
		.where(eq(schema.domainDnsRecord.domainId, domainId));

	return { success: true };
}
