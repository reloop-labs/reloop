import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import type { DatabaseInstance } from "@reloop/db/client";

export async function getOrProvisionCredits(
	orgId: string,
	tx?: DatabaseInstance,
) {
	const billing = await getOrProvisionOrgBilling(orgId, tx);
	return billing.credits;
}
