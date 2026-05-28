import { MailErrors } from "@reloop/be-mail/lib/errors";

export function parseFromAddress_step1(from: string) {
	// Handle RFC 5322 format: "Display Name <email@domain>" or plain "email@domain"
	let emailAddress = from;
	const angleMatch = from.match(/<([^>]+)>/);
	if (angleMatch?.[1]) {
		emailAddress = angleMatch[1];
	}

	const fromParts = emailAddress.split("@");
	if (fromParts.length < 2) {
		throw MailErrors.invalidFromAddress(from);
	}
	const domainName = fromParts[1];
	if (!domainName) {
		throw MailErrors.invalidFromAddress(from);
	}
	return { domainName };
}
