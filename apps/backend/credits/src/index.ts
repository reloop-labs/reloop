import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { creditsConfig } from "./credits.config";
import { loader } from "./loader";
import { db } from "@reloop/db/client";
import { credits, creditTransactions } from "@reloop/db/schema";
import { desc, eq, sql } from "drizzle-orm";

const port = creditsConfig.port;

const app = new Elysia({ prefix: "/api/credits", name: "Credits Service" })
	.use(cors({ origin: "*" }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Credits Service",
					version: "1.0.0",
				},
			},
		}),
	)
	.get("/balance/:orgId", async ({ params }) => {
		const result = await db.query.credits.findFirst({
			where: eq(credits.organizationId, params.orgId),
		});
		return result || { organizationId: params.orgId, amount: 0 };
	}, {
		params: t.Object({
			orgId: t.String(),
		}),
	})
	.get("/transactions/:orgId", async ({ params }) => {
		return await db.query.creditTransactions.findMany({
			where: eq(creditTransactions.organizationId, params.orgId),
			orderBy: [desc(creditTransactions.createdAt)],
			limit: 50,
		});
	}, {
		params: t.Object({
			orgId: t.String(),
		}),
	})
	.post("/topup", async ({ body }) => {
		const { organizationId, amount, type, metadata } = body;
		
		await db.transaction(async (tx) => {
			await tx
				.insert(credits)
				.values({
					organizationId,
					amount,
				})
				.onConflictDoUpdate({
					target: [credits.organizationId],
					set: {
						amount: sql`${credits.amount} + ${amount}`,
						updatedAt: new Date(),
					},
				});

			await tx.insert(creditTransactions).values({
				organizationId,
				amount,
				type: type || "topup",
				metadata,
			});
		});

		return { success: true };
	}, {
		body: t.Object({
			organizationId: t.String(),
			amount: t.Number(),
			type: t.Optional(t.String()),
			metadata: t.Optional(t.Record(t.String(), t.Any())),
		}),
	})
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(`Credits Server is running on http://localhost:${port}/api/credits`);
	});

export type App = typeof app;
