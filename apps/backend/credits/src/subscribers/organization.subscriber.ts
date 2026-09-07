import { BusEvent, bus } from "@reloop/bus";
import {
	ensurePolarCustomerForOrg,
	getOrProvisionOrgBilling,
} from "@reloop/credits/lib/org-billing";
import { livePolarBilling } from "@reloop/credits/lib/polar";
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
					await getOrProvisionOrgBilling(payload.id, tx);
				});

				if (livePolarBilling.enabled) {
					try {
						await ensurePolarCustomerForOrg({
							organizationId: payload.id,
							polar: livePolarBilling,
						});
					} catch (error) {
						log.error({
							...{ error, organizationId: payload.id },
							message: "Failed to create Polar customer for new organization",
						});
					}
				}

				log.info({
					...{ organizationId: payload.id },
					message: "Initialized billing for new organization",
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
