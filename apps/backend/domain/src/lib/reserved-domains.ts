import { isSelfHosted } from "@reloop/db/self-hosted";
import { domainConfig } from "@reloop/domain/domain.config";

/**
 * Domains customers can never add: Reloop's own sender domains and, on the
 * hosted platform, HOST_DOMAIN. Subdomains count too, so
 * `smtp.reloop.sh` is as reserved as `reloop.sh`. Self-hosters may send from
 * their own HOST_DOMAIN, so it is only reserved on the hosted platform.
 */
function reservedRoots(): string[] {
	return [
		domainConfig.ONBOARDING_TEST_DOMAIN,
		domainConfig.RELOOP_SENDER_DOMAIN,
		isSelfHosted() ? "" : domainConfig.HOST_DOMAIN,
	]
		.map((d) => d.trim().toLowerCase().replace(/\.$/, ""))
		.filter(Boolean);
}

export function isReservedDomain(input: string): boolean {
	const name = input.trim().toLowerCase().replace(/\.$/, "");
	return reservedRoots().some(
		(root) => name === root || name.endsWith(`.${root}`),
	);
}
