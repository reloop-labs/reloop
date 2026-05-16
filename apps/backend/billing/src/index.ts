import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { db } from "@reloop/db/client";
import {
	billingInvoice,
	creditLedger,
	emailSend,
	member,
	plan,
	subscription,
	user,
} from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { billingConfig } from "./billing.config";
import { loader, usageEventEmitter } from "./loader";
import { authMiddleware } from "./middleware/auth-middleware";

const port = billingConfig.port;

const app = new Elysia({ prefix: "/api/billing", name: "Billing Service" })
	.use(cors({ origin: "*", credentials: true }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Billing Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						cookieAuth: { type: "apiKey", in: "cookie", name: "better-auth.session_token" },
					},
				},
			},
		}),
	)
	.use(authMiddleware)

	// ─── Usage Summary ──────────────────────────────────────────────────────────
	// Returns all data needed by the Usage page in a single call.
	.get(
		"/usage",
		async ({ activeOrganizationId }) => {
			const orgId = activeOrganizationId;

			// 1. Active subscription + plan
			const activeSub = await db.query.subscription.findFirst({
				where: (s, { and, eq }) =>
					and(eq(s.organizationId, orgId), eq(s.status, "active")),
				with: { plan: true },
			});

			if (!activeSub) {
				return { error: "No active subscription found" };
			}

			const now = new Date();
			const todayStart = new Date(now);
			todayStart.setHours(0, 0, 0, 0);
			const yesterdayStart = new Date(todayStart);
			yesterdayStart.setDate(yesterdayStart.getDate() - 1);

			// 2. Emails sent today (in current billing period)
			const [todayRow] = await db
				.select({ total: count() })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, orgId),
						eq(emailSend.subscriptionId, activeSub.id),
						gte(emailSend.sentAt, todayStart),
					),
				);

			// 3. Emails sent yesterday
			const [yesterdayRow] = await db
				.select({ total: count() })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, orgId),
						eq(emailSend.subscriptionId, activeSub.id),
						gte(emailSend.sentAt, yesterdayStart),
						lt(emailSend.sentAt, todayStart),
					),
				);

			// 4. Delivery rate: sent / (sent + failed + bounced) in this period
			const [deliveryRow] = await db
				.select({
					sent: count(
						sql`CASE WHEN ${emailSend.status} = 'sent' THEN 1 END`,
					),
					failed: count(
						sql`CASE WHEN ${emailSend.status} IN ('failed', 'bounced') THEN 1 END`,
					),
				})
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, orgId),
						gte(emailSend.sentAt, activeSub.currentPeriodStart),
					),
				);

			const sentCount = Number(deliveryRow?.sent ?? 0);
			const failedCount = Number(deliveryRow?.failed ?? 0);
			const totalAttempted = sentCount + failedCount;
			const deliveryRate =
				totalAttempted > 0
					? Math.round((sentCount / totalAttempted) * 1000) / 10
					: 100;

			// 5. Daily average — spread creditsUsed over days elapsed in period
			const periodStart = activeSub.currentPeriodStart;
			const daysElapsed = Math.max(
				1,
				Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
			);
			const dailyAverage = Math.round(activeSub.creditsUsed / daysElapsed);

			// 6. Member count — active and non-banned
			const [memberRow] = await db
				.select({ total: count() })
				.from(member)
				.innerJoin(user, eq(member.userId, user.id))
				.where(
					and(
						eq(member.organizationId, orgId),
						eq(user.banned, false),
					),
				);

			return {
				plan: {
					name: activeSub.plan.name,
					monthlyCredits: activeSub.plan.monthlyCredits,
					basePriceUsd: activeSub.plan.basePriceUsd,
					billingCycle: activeSub.plan.billingCycle,
					ratePerSecond: activeSub.plan.ratePerSecond,
					ratePerMinute: activeSub.plan.ratePerMinute,
					ratePerHour: activeSub.plan.ratePerHour,
					maxAttachmentSizeMb: activeSub.plan.maxAttachmentSizeMb,
					overageLimit: activeSub.plan.overageLimit,
				},
				subscription: {
					status: activeSub.status,
					creditsUsed: activeSub.creditsUsed,
					creditsRemaining: activeSub.creditsRemaining,
					currentPeriodStart: activeSub.currentPeriodStart.toISOString(),
					currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
				},
				stats: {
					emailsSentThisMonth: activeSub.creditsUsed,
					emailsSentToday: Number(todayRow?.total ?? 0),
					emailsSentYesterday: Number(yesterdayRow?.total ?? 0),
					dailyAverage,
					deliveryRate,
				},
				members: {
					total: Number(memberRow?.total ?? 0),
				},
			};
		},
		{
			cookieAuth: true,
			detail: {
				summary: "Get usage summary",
				description:
					"Returns full usage snapshot for the authenticated user's active organization",
			},
		},
	)

	// ─── Plan Info ──────────────────────────────────────────────────────────────
	.get(
		"/plan",
		async ({ activeOrganizationId }) => {
			const orgId = activeOrganizationId;

			const activeSub = await db.query.subscription.findFirst({
				where: (s, { and, eq }) =>
					and(eq(s.organizationId, orgId), eq(s.status, "active")),
				with: { plan: true },
			});

			if (!activeSub) return { error: "No active subscription found" };

			return {
				plan: activeSub.plan,
				subscription: {
					status: activeSub.status,
					currentPeriodStart: activeSub.currentPeriodStart.toISOString(),
					currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
					creditsUsed: activeSub.creditsUsed,
					creditsRemaining: activeSub.creditsRemaining,
				},
			};
		},
		{
			cookieAuth: true,
			detail: { summary: "Get plan & subscription info" },
		},
	)

	// ─── Invoices ───────────────────────────────────────────────────────────────
	.get(
		"/invoices",
		async ({ activeOrganizationId }) => {
			return await db.query.billingInvoice.findMany({
				where: eq(billingInvoice.organizationId, activeOrganizationId),
				orderBy: [desc(billingInvoice.createdAt)],
			});
		},
		{
			cookieAuth: true,
			detail: { summary: "List invoices for the authenticated org" },
		},
	)

	// ─── Credit Ledger ──────────────────────────────────────────────────────────
	.get(
		"/transactions",
		async ({ activeOrganizationId }) => {
			return await db.query.creditLedger.findMany({
				where: eq(creditLedger.organizationId, activeOrganizationId),
				orderBy: [desc(creditLedger.createdAt)],
				limit: 50,
			});
		},
		{
			cookieAuth: true,
			detail: { summary: "List credit ledger entries for the authenticated org" },
		},
	)

	// ─── Manual Top-up (admin use) ──────────────────────────────────────────────
	.post(
		"/topup",
		async ({ body }) => {
			const { organizationId, amount, reason } = body;

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
			detail: { summary: "Manual credit top-up (admin)" },
		},
	)

	// ─── SSE — Real-time usage updates via NATS ─────────────────────────────────
	// The frontend subscribes here; whenever EMAIL_SENT is processed and
	// USAGE_UPDATED is published on NATS, we push the snapshot down the stream.
	.get(
		"/sse/usage",
		async ({ activeOrganizationId, request }) => {
			const orgId = activeOrganizationId;

			const stream = new ReadableStream({
				start(controller) {
					const encoder = new TextEncoder();

					const onUsageUpdated = (payload: {
						organizationId: string;
						[key: string]: unknown;
					}) => {
						if (payload.organizationId !== orgId) return;
						const data = `data: ${JSON.stringify(payload)}\n\n`;
						controller.enqueue(encoder.encode(data));
					};

					usageEventEmitter.on("usage:updated", onUsageUpdated);

					// Send initial ping so the client knows the connection is alive
					controller.enqueue(
						encoder.encode(`: connected org=${orgId}\n\n`),
					);

					// Clean up on disconnect
					request.signal.addEventListener("abort", () => {
						usageEventEmitter.off("usage:updated", onUsageUpdated);
						controller.close();
					});
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"X-Accel-Buffering": "no",
				},
			});
		},
		{
			cookieAuth: true,
			detail: {
				summary: "SSE stream for real-time usage updates",
				description:
					"Streams USAGE_UPDATED events for the authenticated org whenever credits are deducted",
			},
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
