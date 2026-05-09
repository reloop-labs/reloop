import { MailErrors } from "@reloop/be-mailing/lib/errors";

/**
 * Step 1: Parse and validate the 'from' email address format.
 */
export function parseFromAddress_step1(from: string) {
	const fromParts = from.split("@");
	if (fromParts.length < 2) {
		throw MailErrors.invalidFromAddress(from);
	}
	const domainName = fromParts[1];
	if (!domainName) {
		throw MailErrors.invalidFromAddress(from);
	}
	return { domainName };
}
