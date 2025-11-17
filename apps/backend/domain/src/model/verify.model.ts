import { t } from "elysia";

export namespace VerifyModel {
	// DNS validation request
	export const dnsVerifyBody = t.Object({
		domain: t.String({ minLength: 1, maxLength: 255 }),
		recordTypes: t.Optional(t.Array(t.String())), // e.g., ['MX', 'A', 'CNAME', 'TXT']
	});

	export type DnsVerifyBody = typeof dnsVerifyBody.static;

	// DNS record response
	export const dnsRecord = t.Object({
		type: t.String(),
		name: t.String(),
		value: t.String(),
		ttl: t.Number(),
		priority: t.Optional(t.Number()),
	});

	export type DnsRecord = typeof dnsRecord.static;

	// DNS validation response
	export const dnsVerifyResponse = t.Object({
		domain: t.String(),
		isValid: t.Boolean(),
		records: t.Array(dnsRecord),
		missingRecords: t.Array(t.String()),
		errors: t.Array(t.String()),
		checkedAt: t.String(),
	});

	export type DnsVerifyResponse = typeof dnsVerifyResponse.static;

	// DNS validation error
	export const dnsVerifyError = t.Object({
		message: t.Literal("DNS validation failed"),
	});
	export type DnsVerifyError = typeof dnsVerifyError.static;
}
