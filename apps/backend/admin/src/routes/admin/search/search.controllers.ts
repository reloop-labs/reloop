import { db } from "@reloop/db/client";
import { domain, organization, user } from "@reloop/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

const DEFAULT_LIMIT = 8;

export async function globalSearchController({
	q,
	limit = DEFAULT_LIMIT,
}: {
	q: string;
	limit?: number;
}) {
	const term = q.trim();
	if (term.length < 1) {
		return {
			users: [],
			organizations: [],
			domains: [],
		};
	}

	const pattern = `%${term}%`;
	const take = Math.min(Math.max(limit, 1), 20);

	const [users, organizations, domains] = await Promise.all([
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				banned: user.banned,
			})
			.from(user)
			.where(or(ilike(user.email, pattern), ilike(user.name, pattern)))
			.orderBy(desc(user.createdAt))
			.limit(take),
		db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				status: organization.status,
			})
			.from(organization)
			.where(
				or(
					ilike(organization.name, pattern),
					ilike(organization.slug, pattern),
				),
			)
			.orderBy(desc(organization.createdAt))
			.limit(take),
		db
			.select({
				id: domain.id,
				domain: domain.domain,
				status: domain.status,
				organizationId: domain.organizationId,
				organizationName: organization.name,
			})
			.from(domain)
			.innerJoin(organization, eq(domain.organizationId, organization.id))
			.where(
				and(sql`${domain.deletedAt} IS NULL`, ilike(domain.domain, pattern)),
			)
			.orderBy(desc(domain.createdAt))
			.limit(take),
	]);

	return {
		users: users.map((u) => ({
			...u,
			banned: u.banned ?? false,
		})),
		organizations,
		domains,
	};
}
