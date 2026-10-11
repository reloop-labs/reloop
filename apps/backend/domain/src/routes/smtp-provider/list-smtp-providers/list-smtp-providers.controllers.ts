import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import {
	getSmtpProviderLimit,
	loadRelayDomains,
	presentSmtpProvider,
} from "@reloop/domain/lib/smtp-provider";
import { asc, eq } from "drizzle-orm";

export async function listSmtpProvidersController(organizationId: string) {
	const [rows, limit] = await Promise.all([
		db.query.smtpProvider.findMany({
			where: eq(smtpProvider.organizationId, organizationId),
			orderBy: asc(smtpProvider.createdAt),
		}),
		getSmtpProviderLimit(organizationId),
	]);
	const domains = await loadRelayDomains(rows.map((r) => r.id));
	return {
		object: "list" as const,
		limit,
		items: rows.map((row) =>
			presentSmtpProvider({ ...row, domains: domains.get(row.id) }),
		),
	};
}
