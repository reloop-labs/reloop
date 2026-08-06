import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import {
	generateTrackingCNAMERecord,
	getCustomReturnPathSubString,
	getDomainHost,
} from "@reloop/domain/utils";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Ensures the domain has a tracking CNAME (click + open) pointing at
 * `TRACKING_DOMAIN` (default `link.{HOST_DOMAIN}`).
 *
 * Creates the row when missing (legacy domains) and repairs mismatched
 * name/value so verification and the dashboard show the record users must add.
 */
export async function ensureTrackingCnameRecord({
	domainId,
	organizationId,
	userId,
	domain,
	trackingSubdomain = domainConfig.constants.defaultTrackingSubdomain,
}: {
	domainId: string;
	organizationId: string;
	userId: string;
	domain: string;
	trackingSubdomain?: string;
}): Promise<void> {
	const expected = generateTrackingCNAMERecord(
		getCustomReturnPathSubString(domain, trackingSubdomain),
		getDomainHost(domain),
	);

	const existing = await db.query.domainDnsRecord.findMany({
		where: and(
			eq(schema.domainDnsRecord.domainId, domainId),
			eq(schema.domainDnsRecord.recordType, "CNAME"),
			eq(schema.domainDnsRecord.purpose, "tracking"),
			isNull(schema.domainDnsRecord.deletedAt),
		),
	});

	const isCorrect = (r: (typeof existing)[number]) =>
		r.name === expected.name &&
		r.fqdn === expected.fqdn &&
		r.value.toLowerCase().replace(/\.$/, "") ===
			expected.value.toLowerCase().replace(/\.$/, "");

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

	const [primary, ...rest] = existing;
	if (primary) {
		await db
			.update(schema.domainDnsRecord)
			.set({
				name: expected.name,
				fqdn: expected.fqdn,
				value: expected.value,
				ttl: expected.ttl,
				priority: null,
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
		priority: null,
		recordTypeName: "CNAME",
		purpose: "tracking",
		status: "pending",
	});
}
