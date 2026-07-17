import { domainConfig } from "@reloop/domain/domain.config";
import { generateReceivingMXRecordForDomain } from "@reloop/domain/utils/dns-record-generator";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Ensures the domain has a receiving MX record on the customer domain
 * (apex `@` or product subdomain) pointing at `inbound.{HOST_DOMAIN}`.
 *
 * Repairs legacy rows that used the custom return-path label as the MX name
 * and/or pointed at bare HOST_DOMAIN instead of inbound.HOST_DOMAIN.
 *
 * Updates in place when possible to avoid unique-constraint clashes with
 * soft-deleted rows (unique is on domainId+type+name+value, ignores deletedAt).
 */
export async function ensureReceivingMxRecord({
	domainId,
	organizationId,
	userId,
	domain,
}: {
	domainId: string;
	organizationId: string;
	userId: string;
	domain: string;
}): Promise<void> {
	const expected = generateReceivingMXRecordForDomain(
		domain,
		domainConfig.HOST_DOMAIN,
	);

	const existing = await db.query.domainDnsRecord.findMany({
		where: and(
			eq(schema.domainDnsRecord.domainId, domainId),
			eq(schema.domainDnsRecord.recordType, "MX"),
			eq(schema.domainDnsRecord.purpose, "receiving"),
			isNull(schema.domainDnsRecord.deletedAt),
		),
	});

	const isCorrect = (r: (typeof existing)[number]) =>
		r.name === expected.name &&
		r.fqdn === expected.fqdn &&
		r.value.toLowerCase().replace(/\.$/, "") ===
			expected.value.toLowerCase().replace(/\.$/, "") &&
		Number(r.priority ?? 0) === Number(expected.priority ?? 0);

	const match = existing.find(isCorrect);
	if (match) {
		const extras = existing.filter((r) => r.id !== match.id);
		if (extras.length > 0) {
			await Promise.all(
				extras.map((r) =>
					db
						.update(schema.domainDnsRecord)
						.set({ deletedAt: new Date() })
						.where(eq(schema.domainDnsRecord.id, r.id)),
				),
			);
		}
		return;
	}

	// Prefer updating one existing receiving row to the correct shape
	const [primary, ...rest] = existing;
	if (primary) {
		await db
			.update(schema.domainDnsRecord)
			.set({
				name: expected.name,
				fqdn: expected.fqdn,
				value: expected.value,
				ttl: expected.ttl,
				priority: expected.priority,
				status: "pending",
				verificationError: null,
				updatedAt: new Date(),
			})
			.where(eq(schema.domainDnsRecord.id, primary.id));

		if (rest.length > 0) {
			await Promise.all(
				rest.map((r) =>
					db
						.update(schema.domainDnsRecord)
						.set({ deletedAt: new Date() })
						.where(eq(schema.domainDnsRecord.id, r.id)),
				),
			);
		}
		return;
	}

	await db.insert(schema.domainDnsRecord).values({
		domainId,
		organizationId,
		userId,
		domain,
		recordType: expected.type,
		name: expected.name,
		fqdn: expected.fqdn,
		value: expected.value,
		ttl: expected.ttl,
		priority: expected.priority,
		recordTypeName: "MX",
		purpose: "receiving",
		status: "pending",
	});
}
