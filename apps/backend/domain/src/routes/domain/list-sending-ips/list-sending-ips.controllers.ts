import {
	listOrganizationSendingIps,
	presentOrganizationSendingIps,
} from "@reloop/db";

export async function listSendingIpsController(organizationId: string) {
	const result = await listOrganizationSendingIps(organizationId);
	return presentOrganizationSendingIps(result);
}
