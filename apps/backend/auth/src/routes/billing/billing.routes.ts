import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import {
	lagoCreateSubscription,
	lagoListInvoices,
	lagoUpgradeSubscription,
	PLAN_CREDITS,
	PLANS,
	type PlanCode,
} from "../../lib/lago";
import { authMiddleware } from "../middleware/auth-middleware";

export const billingRoutes = new Elysia({
	prefix: "/v1/billing",
	name: "BillingRoutes",
})
	.use(authMiddleware)

	// ─── GET /plans ─────────────────────────────────────────────────────────────
	.get("/plans", () => {
		return Object.entries(PLANS).map(([code, plan]) => ({
			code,
			...plan,
		}));
	})

	// ─── GET /subscription ───────────────────────────────────────────────────────
	.get("/subscription", async ({ organizationId }) => {
		const org = await db.query.organization.findFirst({
			where: (o, { eq }) => eq(o.id, organizationId),
			columns: {
				id: true,
				planCode: true,
				subscriptionStatus: true,
				creditsRemaining: true,
				monthlyCredits: true,
				currentPeriodEnd: true,
				lagoSubscriptionId: true,
				externalCustomerId: true,
			},
		});

		if (!org) return { error: "Organization not found" };

		const plan = PLANS[(org.planCode as PlanCode) ?? "free"];

		return {
			plan: {
				code: org.planCode ?? "free",
				name: plan.name,
				monthlyCredits: plan.monthlyCredits,
				priceUsd: plan.priceUsd,
			},
			subscription: {
				status: org.subscriptionStatus,
				creditsRemaining: org.creditsRemaining,
				monthlyCredits: org.monthlyCredits,
				currentPeriodEnd: org.currentPeriodEnd?.toISOString() ?? null,
				lagoSubscriptionId: org.lagoSubscriptionId,
			},
		};
	})

	// ─── GET /invoices ───────────────────────────────────────────────────────────
	.get("/invoices", async ({ organizationId }) => {
		const org = await db.query.organization.findFirst({
			where: (o, { eq }) => eq(o.id, organizationId),
			columns: { externalCustomerId: true },
		});

		if (!org?.externalCustomerId) return [];

		try {
			return await lagoListInvoices(org.externalCustomerId);
		} catch (err) {
			log.error({ message: "Failed to fetch invoices from Lago", error: err });
			return [];
		}
	})

	// ─── POST /upgrade ───────────────────────────────────────────────────────────
	.post(
		"/upgrade",
		async ({ body, organizationId }) => {
			const { planCode } = body;

			if (!(planCode in PLANS)) {
				return { error: "Invalid plan code" };
			}

			const org = await db.query.organization.findFirst({
				where: (o, { eq }) => eq(o.id, organizationId),
				columns: {
					externalCustomerId: true,
					lagoSubscriptionId: true,
					planCode: true,
				},
			});

			if (!org?.externalCustomerId) {
				return { error: "Organization billing not set up" };
			}

			try {
				let newSubId = org.lagoSubscriptionId;

				if (org.lagoSubscriptionId) {
					// Upgrade existing subscription
					const sub = await lagoUpgradeSubscription(
						org.lagoSubscriptionId,
						planCode as PlanCode,
					);
					newSubId = sub.external_id;
				} else {
					// Create new subscription if none exists
					const sub = await lagoCreateSubscription(
						org.externalCustomerId,
						planCode as PlanCode,
					);
					newSubId = sub.external_id;
				}

				const newCredits = PLAN_CREDITS[planCode as PlanCode];

				await db
					.update(schema.organization)
					.set({
						planCode,
						lagoSubscriptionId: newSubId,
						creditsRemaining: newCredits,
						monthlyCredits: newCredits,
						subscriptionStatus: "active",
					})
					.where(eq(schema.organization.id, organizationId));

				return { success: true, planCode, creditsRemaining: newCredits };
			} catch (err) {
				log.error({ message: "Failed to upgrade plan", error: err });
				return { error: "Failed to upgrade plan, please try again" };
			}
		},
		{
			body: t.Object({ planCode: t.String() }),
		},
	)

	// ─── POST /webhook ───────────────────────────────────────────────────────────
	// Lago fires webhook events here — no auth middleware (uses webhook signature)
	.post(
		"/webhook",
		async ({ body }) => {
			const event = body as Record<string, any>;
			const webhookType: string = event.webhook_type ?? "";

			log.info({ message: `Lago webhook received: ${webhookType}` });

			try {
				if (webhookType === "invoice.payment_status_updated") {
					const invoice = event.invoice;
					const customerId: string =
						invoice?.customer?.external_id ?? invoice?.external_customer_id;
					const paymentStatus: string = invoice?.payment_status;

					if (!customerId) return { received: true };

					if (paymentStatus === "succeeded") {
						// Determine plan from subscription
						const planCode =
							(invoice?.subscriptions?.[0]?.plan?.code as PlanCode) ??
							"starter";
						const credits = PLAN_CREDITS[planCode] ?? PLAN_CREDITS.starter;

						await db
							.update(schema.organization)
							.set({
								creditsRemaining: credits,
								monthlyCredits: credits,
								subscriptionStatus: "active",
								planCode,
								currentPeriodEnd: invoice?.subscriptions?.[0]?.ending_at
									? new Date(invoice.subscriptions[0].ending_at)
									: null,
							})
							.where(eq(schema.organization.externalCustomerId, customerId));

						log.info({
							message: `Credits renewed for org ${customerId}: ${credits}`,
						});
					} else if (paymentStatus === "failed") {
						await db
							.update(schema.organization)
							.set({ subscriptionStatus: "past_due" })
							.where(eq(schema.organization.externalCustomerId, customerId));

						log.warn({ message: `Payment failed for org ${customerId}` });
					}
				}

				if (webhookType === "subscription.terminated") {
					const customerId: string =
						event.subscription?.external_customer_id ?? "";
					if (customerId) {
						await db
							.update(schema.organization)
							.set({ subscriptionStatus: "cancelled", creditsRemaining: 0 })
							.where(eq(schema.organization.externalCustomerId, customerId));
					}
				}
			} catch (err) {
				log.error({ message: "Error processing Lago webhook", error: err });
			}

			return { received: true };
		},
		{ body: t.Any() },
	);
