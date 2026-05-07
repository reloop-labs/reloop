import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { db } from "@reloop/db/client";
import {
	billingInvoice,
	creditLedger,
	plan,
	subscription,
} from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, desc, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { billingConfig } from "./billing.config";
import { loader } from "./loader";

const port = billingConfig.port;

const app = new Elysia({ prefix: "/api/billing", name: "Billing Service" })
	.use(cors({ origin: "*" }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Billing Service",
					version: "1.0.0",
				},
			},
		}),
	)
	.get(
		"/balance/:orgId",
		async ({ params }) => {
			const result = await db.query.subscription.findFirst({
				where: (s, { and, eq }) =>
					and(eq(s.organizationId, params.orgId), eq(s.status, "active")),
				with: {
					plan: true,
				},
			});

			return result || { error: "No active subscription found" };
		},
		{
			params: t.Object({
				orgId: t.String(),
			}),
		},
	)
	.get(
		"/transactions/:orgId",
		async ({ params }) => {
			return await db.query.creditLedger.findMany({
				where: eq(creditLedger.organizationId, params.orgId),
				orderBy: [desc(creditLedger.createdAt)],
				limit: 50,
			});
		},
		{
			params: t.Object({
				orgId: t.String(),
			}),
		},
	)
	.get(
		"/invoices/:orgId",
		async ({ params }) => {
			return await db.query.billingInvoice.findMany({
				where: eq(billingInvoice.organizationId, params.orgId),
				orderBy: [desc(billingInvoice.createdAt)],
			});
		},
		{
			params: t.Object({
				orgId: t.String(),
			}),
		},
	)
	.post(
		"/topup",
		async ({ body }) => {
			const { organizationId, amount, reason, metadata } = body;

			await db.transaction(async (tx) => {
				const activeSub = await tx.query.subscription.findFirst({
					where: (s, { and, eq }) =>
						and(eq(s.organizationId, organizationId), eq(s.status, "active")),
				});

				if (!activeSub) throw new Error("No active subscription");

				await tx
					.update(subscription)
					.set({
						creditsRemaining: sql`${subscription.creditsRemaining} + ${amount}`,
						updatedAt: new Date(),
					})
					.where(eq(subscription.id, activeSub.id));

				await tx.insert(creditLedger).values({
					organizationId,
					subscriptionId: activeSub.id,
					entryType: "manual_adjustment",
					delta: amount,
					balanceAfter: activeSub.creditsRemaining + amount,
					reason: reason || "Manual top-up",
				});
			});

			return { success: true };
		},
		{
			body: t.Object({
				organizationId: t.String(),
				amount: t.Number(),
				reason: t.Optional(t.String()),
				metadata: t.Optional(t.Record(t.String(), t.Any())),
			}),
		},
	)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Billing Server is running on http://localhost:${port}/api/billing`,
		);
	});

export type App = typeof app;
