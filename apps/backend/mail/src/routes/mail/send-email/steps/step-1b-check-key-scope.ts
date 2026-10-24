import { MailErrors } from "@reloop/be-mail/lib/errors";
import { apiKeyAllowsAddress } from "@reloop/db/api-key-scope";

/** Bare address from `"Name <a@b.com>"` or `a@b.com`. */
export function bareFromAddress(from: string): string {
	const angle = from.match(/<([^>]+)>/);
	return (angle?.[1] ?? from).trim().toLowerCase();
}

/**
 * Keys with address restrictions (api_key_scope) may only send from the
 * domains or addresses they list. Unrestricted keys pass.
 */
export async function checkApiKeyScope_step1b({
	apiKeyId,
	from,
}: {
	apiKeyId: string;
	from: string;
}): Promise<void> {
	const address = bareFromAddress(from);
	if (!(await apiKeyAllowsAddress(apiKeyId, address))) {
		throw MailErrors.apiKeyAddressNotAllowed(address);
	}
}
