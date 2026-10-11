import * as z from "zod";
import type { DnsRecord, Domain } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const DOMAIN_NAME_PATTERN =
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const domainIdSchema = resourceIdSchema.describe(
	"Domain ID as returned by Reloop, for example dom_123456789",
);

export const domainNameSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(4)
	.max(255)
	.regex(DOMAIN_NAME_PATTERN, "must be a domain name such as send.example.com")
	.describe(
		"Domain or subdomain to send from, for example send.example.com. A dedicated subdomain keeps the root domain's reputation separate.",
	);

export const domainStatusSchema = z.enum([
	"pending",
	"verifying",
	"active",
	"suspended",
	"failed",
]);

export const domainTlsSchema = z.enum(["opportunistic", "enforced"]);

export const domainSettingsShape = {
	clickTracking: z
		.boolean()
		.optional()
		.describe("Rewrite links to track clicks"),
	openTracking: z.boolean().optional().describe("Embed a pixel to track opens"),
	sendingEmail: z
		.boolean()
		.optional()
		.describe("Allow sending email from this domain"),
	receivingEmail: z
		.boolean()
		.optional()
		.describe("Accept inbound email for this domain; requires an MX record"),
	tls: domainTlsSchema
		.optional()
		.describe(
			"opportunistic uses TLS when the receiver supports it; enforced refuses to deliver without it",
		),
};

export const dnsRecordSchema = z.object({
	type: z.string().describe("Record type to create at the DNS provider"),
	name: z.string().describe("Host name of the record"),
	value: z.string(),
	ttl: z.string(),
	priority: z.number().nullable(),
	purpose: z.enum(["sending", "receiving", "tracking"]),
	status: domainStatusSchema,
	verificationError: z.string().nullable(),
});

const domainFields = {
	id: z.string(),
	domain: z.string(),
	status: domainStatusSchema.describe(
		"active domains can send; pending and failed need DNS changes then verify_domain",
	),
	sendingEmail: z.boolean(),
	receivingEmail: z.boolean(),
	clickTracking: z.boolean(),
	openTracking: z.boolean(),
	tls: domainTlsSchema,
	verificationFailedReason: z.string().nullable(),
	dailyCap: z
		.number()
		.nullable()
		.describe("Emails this domain may send per day; null when uncapped"),
	sentToday: z.number().nullable(),
	lastVerifiedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
};

export const domainSummarySchema = z.object(domainFields);

export const domainSchema = z.object({
	...domainFields,
	dnsRecords: z
		.array(dnsRecordSchema)
		.describe("Records to add at the DNS provider before verify_domain"),
});

type DomainSummaryOutput = z.output<typeof domainSummarySchema>;

function toDnsRecordOutput(
	record: DnsRecord,
): z.output<typeof dnsRecordSchema> {
	return {
		type: record.recordType,
		name: record.name,
		value: record.value,
		ttl: record.ttl,
		priority: record.priority,
		purpose: record.purpose,
		status: record.status,
		verificationError: record.verificationError,
	};
}

export function toDomainSummaryOutput(domain: Domain): DomainSummaryOutput {
	return {
		id: domain.id,
		domain: domain.domain,
		status: domain.status,
		sendingEmail: domain.isSendingEmailEnabled,
		receivingEmail: domain.isReceivingEmailEnabled,
		clickTracking: domain.isClickTrackingEnabled,
		openTracking: domain.isOpenTrackingEnabled,
		tls: domain.tls,
		verificationFailedReason: domain.verificationFailedReason,
		dailyCap: domain.dailyCap ?? null,
		sentToday: domain.sentToday ?? null,
		lastVerifiedAt: domain.lastVerifiedAt,
		createdAt: domain.createdAt,
		updatedAt: domain.updatedAt,
	};
}

export function toDomainOutput(domain: Domain): z.output<typeof domainSchema> {
	return {
		...toDomainSummaryOutput(domain),
		dnsRecords: domain.dnsRecords.map(toDnsRecordOutput),
	};
}
