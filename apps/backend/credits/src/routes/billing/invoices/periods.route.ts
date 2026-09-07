import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { db } from "@reloop/db/client";
import { billingPeriod } from "@reloop/db/schema";
import { desc, eq } from "drizzle-orm";
import { Elysia } from "elysia";

export const periodsRoute = new Elysia().use(authMiddleware).get(
	"/periods",
	async ({ organizationId }) => {
		return await db.query.billingPeriod.findMany({
			where: eq(billingPeriod.organizationId, organizationId),
			orderBy: [desc(billingPeriod.periodStart)],
			limit: 24,
			columns: {
				id: true,
				planId: true,
				periodStart: true,
				periodEnd: true,
				includedEmails: true,
				emailsUsed: true,
				emailsOverage: true,
			},
		});
	},
	{
		auth: true,
		response: {
			200: CreditsModel.periodsResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Billing"],
			summary: "List closed billing periods",
			description:
				"Returns saved monthly usage snapshots for the active organization.",
		},
	},
);
