import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { useLogger } from "evlog/elysia";

export async function createDomainEntry_step4({
	userId,
	organizationId,
	domain,
	customReturnPath,
	trackingSubdomain,
	clickTracking,
	openTracking,
	tls,
	isSendingEmailEnabled,
	isReceivingEmailEnabled,
}: {
	userId: string;
	organizationId: string;
	domain: string;
	customReturnPath?: string;
	trackingSubdomain?: string;
	clickTracking?: boolean;
	openTracking?: boolean;
	tls?: "opportunistic" | "enforced";
	isSendingEmailEnabled?: boolean;
	isReceivingEmailEnabled?: boolean;
}) {
	const log = useLogger();
	const domainId = `domain_${createId()}`;
	log.info("Creating domain");

	await db.insert(schema.domain).values({
		id: domainId,
		userId: userId,
		organizationId: organizationId,
		domain: domain,

		status: "start-verify",
		userVerifiedDomain: false,
		systemVerified: false,
		customReturnPath,
		trackingSubdomain,
		isClickTrackingEnabled: clickTracking,
		isOpenTrackingEnabled: openTracking,
		tls,
		isSendingEmailEnabled,
		isReceivingEmailEnabled,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return { domainId };
}
