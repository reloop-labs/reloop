import { BusEvent, bus } from "@reloop/bus";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import { log } from "evlog";

export async function initOrganizationSubscriber() {
	await bus.subscribe(
		BusEvent.ORGANIZATION_CREATED,
		async (payload) => {
			log.info({
				...{ organizationId: payload.id },
				message: "Handling ORGANIZATION_CREATED",
			});
			try {
				await db.transaction(async (tx) => {
					await getOrProvisionCredits(payload.id, tx);
				});

				log.info({
					...{ organizationId: payload.id },
					message: "Initialized credits for new organization",
				});
			} catch (error) {
				log.error({
					...{ error, organizationId: payload.id },
					message: "Failed to initialize credits",
				});
			}
		},
		{ queue: "credits-org-created-worker" },
	);
}
