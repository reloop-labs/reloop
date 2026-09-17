import { sendSlackDomainAddedNotification } from "@reloop/admin/services/slack/slack.service";
import { BusEvent, bus, type DomainCreatedPayload } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { domain, organization, user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

async function domainContext(payload: DomainCreatedPayload) {
	const [row] = await db
		.select({
			orgName: organization.name,
			userName: user.name,
			userEmail: user.email,
		})
		.from(domain)
		.innerJoin(organization, eq(domain.organizationId, organization.id))
		.innerJoin(user, eq(domain.userId, user.id))
		.where(eq(domain.id, payload.domainId))
		.limit(1);

	return {
		orgName: row?.orgName ?? null,
		userName: row?.userName ?? null,
		userEmail: row?.userEmail ?? null,
	};
}

async function notifyDomainAdded(
	payload: DomainCreatedPayload,
	restored: boolean,
) {
	try {
		let orgName: string | null = null;
		let userName: string | null = null;
		let userEmail: string | null = null;
		try {
			const context = await domainContext(payload);
			orgName = context.orgName;
			userName = context.userName;
			userEmail = context.userEmail;
		} catch (err) {
			log.warn({
				error: err instanceof Error ? err.message : String(err),
				domainId: payload.domainId,
				message: "Could not enrich domain Slack alert from database",
			});
		}

		await sendSlackDomainAddedNotification({
			domain: payload.domain,
			domainId: payload.domainId,
			orgId: payload.organizationId,
			orgName,
			userName,
			userEmail,
			restored,
		});
	} catch (err) {
		log.error({
			error: err instanceof Error ? err.message : String(err),
			domainId: payload.domainId,
			domain: payload.domain,
			message: "Failed to process domain bus event for Slack alert",
		});
	}
}

export async function initDomainCreatedSubscriber() {
	try {
		await bus.subscribe(
			BusEvent.DOMAIN_CREATED,
			async (payload: DomainCreatedPayload) => {
				await notifyDomainAdded(payload, false);
			},
			{ queue: "admin-slack-worker" },
		);

		await bus.subscribe(
			BusEvent.DOMAIN_UNDELETED,
			async (payload: DomainCreatedPayload) => {
				await notifyDomainAdded(payload, true);
			},
			{ queue: "admin-slack-worker" },
		);

		log.info("server", "Slack domain-created subscriber registered");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message:
				"Failed to initialize domain-created subscriber for Slack alerts",
		});
	}
}
