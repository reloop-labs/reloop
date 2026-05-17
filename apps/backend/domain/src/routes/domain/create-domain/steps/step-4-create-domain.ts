import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";

export async function createDomainEntry_step4({
	userId,
	organizationId,
	domain,
	customReturnPath,
	clickTracking,
	openTracking,
	tls,
	sendingEmail,
	receivingEmail,
}: {
	userId: string;
	organizationId: string;
	domain: string;
	customReturnPath?: string;
	clickTracking?: boolean;
	openTracking?: boolean;
	tls?: "opportunistic" | "enforced";
	sendingEmail?: boolean;
	receivingEmail?: boolean;
}) {
	const logger = useLogger();
	const domainId = `domain_${createId()}`;
	log.info({ ...{ domainId }, message: "Creating domain" });

	await db.insert(schema.domain).values({
		id: domainId,
		userId: userId,
		organizationId: organizationId,
		domain: domain,
		domainType: "custom",
		status: "start-verify",
		userVerified: false,
		systemVerified: false,
		customReturnPath,
		clickTracking,
		openTracking,
		tls,
		sendingEmail,
		receivingEmail,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return { domainId };
}
