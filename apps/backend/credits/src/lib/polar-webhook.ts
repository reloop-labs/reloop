import {
	changeOrgPlan,
	closeBillingPeriod,
	downgradeOrgToFree,
	getOrProvisionOrgBilling,
	linkPolarCustomerToOrg,
	refillCreditsFromPlan,
} from "@reloop/credits/lib/org-billing";
import { livePolarBilling } from "@reloop/credits/lib/polar";
import {
	invalidatePolarPlanCatalog,
	planIdFromPolarProduct,
} from "@reloop/credits/lib/polar-catalog";
import { db } from "@reloop/db/client";
import {
	organization,
	organizationCredits,
	organizationSubscription,
} from "@reloop/db/schema";
import {
	mapPolarSubscriptionStatus,
	type PlanId,
	polarStatusMap,
} from "@reloop/pricing";
import { eq } from "drizzle-orm";
import { log } from "evlog";

function asRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function bool(value: unknown): boolean | undefined {
	return typeof value === "boolean" ? value : undefined;
}

function date(value: unknown): Date | undefined {
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}
	return undefined;
}

function field(
	data: Record<string, unknown>,
	camel: string,
	snake: string,
): unknown {
	return data[camel] ?? data[snake];
}

async function resolveOrganizationId(
	data: Record<string, unknown>,
): Promise<string | null> {
	const metadata = asRecord(field(data, "metadata", "metadata"));
	const fromMetadata =
		str(metadata?.organization_id) ?? str(metadata?.organizationId);
	if (fromMetadata) return fromMetadata;

	const customer = asRecord(field(data, "customer", "customer"));
	const externalId =
		str(field(customer ?? {}, "externalId", "external_id")) ??
		str(field(data, "externalCustomerId", "external_customer_id"));
	if (externalId) {
		const org = await db.query.organization.findFirst({
			where: eq(organization.id, externalId),
		});
		if (org) return org.id;
	}

	const polarCustomerId =
		str(field(data, "customerId", "customer_id")) ?? str(customer?.id);
	if (polarCustomerId) {
		const org = await db.query.organization.findFirst({
			where: eq(organization.externalCustomerId, polarCustomerId),
		});
		if (org) return org.id;
		const sub = await db.query.organizationSubscription.findFirst({
			where: eq(organizationSubscription.polarCustomerId, polarCustomerId),
		});
		if (sub) return sub.organizationId;
	}

	return null;
}

function productIdFrom(data: Record<string, unknown>): string | undefined {
	const product = asRecord(field(data, "product", "product"));
	return str(field(data, "productId", "product_id")) ?? str(product?.id);
}

export async function handlePolarWebhookEvent(event: {
	type: string;
	data: Record<string, unknown>;
}): Promise<
	{ ok: true; organizationId?: string } | { ok: false; reason: string }
> {
	if (event.type.startsWith("product.")) {
		invalidatePolarPlanCatalog();
		return { ok: true };
	}

	if (event.type.startsWith("subscription.")) {
		return applySubscription(event.data);
	}

	if (event.type.startsWith("customer.") || event.type.startsWith("order.")) {
		return applyCustomerLink(event.data);
	}

	return { ok: true };
}

async function applyCustomerLink(data: Record<string, unknown>) {
	const orgId = await resolveOrganizationId(data);
	const polarCustomerId = str(data.id);
	if (!orgId || !polarCustomerId) return { ok: true as const };

	await linkPolarCustomerToOrg({
		organizationId: orgId,
		polarCustomerId,
	});

	return { ok: true as const, organizationId: orgId };
}

async function applySubscription(data: Record<string, unknown>) {
	const orgId = await resolveOrganizationId(data);
	if (!orgId) {
		log.warn({
			message: "Polar subscription webhook missing organization mapping",
			polarSubscriptionId: str(data.id),
		});
		return { ok: false as const, reason: "organization_not_found" };
	}

	const billing = await getOrProvisionOrgBilling(orgId);
	const polarSubscriptionId = str(data.id);
	const polarCustomerId =
		str(field(data, "customerId", "customer_id")) ??
		str(asRecord(data.customer)?.id);
	const product = asRecord(field(data, "product", "product"));
	const incomingPlanId: PlanId | null = await planIdFromPolarProduct(
		{
			id: productIdFrom(data),
			name: str(product?.name),
			metadata: asRecord(product?.metadata),
		},
		livePolarBilling.enabled ? livePolarBilling : undefined,
	);
	// An unknown Polar status must not grant (or revoke) access: keep ours.
	const rawStatus = str(data.status) ?? "active";
	const knownStatus = Object.hasOwn(polarStatusMap, rawStatus);
	if (!knownStatus) {
		log.warn({
			message: "Unknown Polar subscription status; keeping current status",
			organizationId: orgId,
			polarStatus: rawStatus,
		});
	}
	const status = knownStatus
		? mapPolarSubscriptionStatus(rawStatus)
		: billing.subscription.status;
	const now = new Date();
	const pastDueSince =
		status === "past_due" ? (billing.subscription.pastDueSince ?? now) : null;
	const periodStart =
		date(field(data, "currentPeriodStart", "current_period_start")) ??
		billing.subscription.currentPeriodStart;
	const periodEnd =
		date(field(data, "currentPeriodEnd", "current_period_end")) ??
		billing.subscription.currentPeriodEnd;
	const cancelAtPeriodEnd =
		bool(field(data, "cancelAtPeriodEnd", "cancel_at_period_end")) ?? false;
	const canceledAt = date(field(data, "canceledAt", "canceled_at")) ?? null;

	// Ended subscription (Polar `revoked`, or `canceled` once the period is over).
	// A cancel that only sets cancel_at_period_end stays `active` and keeps the
	// paid plan until Polar revokes it.
	if (status === "cancelled") {
		const storedSubscriptionId = billing.subscription.polarSubscriptionId;
		const isOlderSubscription =
			storedSubscriptionId != null &&
			polarSubscriptionId != null &&
			storedSubscriptionId !== polarSubscriptionId &&
			billing.subscription.status !== "cancelled";
		if (isOlderSubscription) {
			log.info({
				message: "Ignoring cancellation of a replaced Polar subscription",
				organizationId: orgId,
				polarSubscriptionId,
				activeSubscriptionId: storedSubscriptionId,
			});
			return { ok: true as const, organizationId: orgId };
		}

		await db.transaction(async (tx) => {
			const period = await downgradeOrgToFree({ billing, tx });
			await tx
				.update(organizationSubscription)
				.set({
					planId: "free",
					status,
					polarSubscriptionId:
						polarSubscriptionId ?? billing.subscription.polarSubscriptionId,
					polarCustomerId:
						polarCustomerId ?? billing.subscription.polarCustomerId,
					currentPeriodStart: period.periodStart,
					currentPeriodEnd: period.periodEnd,
					cancelAtPeriodEnd,
					canceledAt:
						canceledAt ?? billing.subscription.canceledAt ?? new Date(),
					pastDueSince: null,
					updatedAt: new Date(),
				})
				.where(eq(organizationSubscription.id, billing.subscription.id));

			if (polarCustomerId) {
				await linkPolarCustomerToOrg({
					organizationId: orgId,
					polarCustomerId,
					tx,
				});
			}
		});

		return { ok: true as const, organizationId: orgId };
	}

	// Polar retries can deliver an older event after a newer one. For the same
	// subscription, never move the period backwards (it would reset usage).
	const sameSubscription =
		polarSubscriptionId != null &&
		polarSubscriptionId === billing.subscription.polarSubscriptionId;
	if (
		sameSubscription &&
		periodStart.getTime() < billing.subscription.currentPeriodStart.getTime()
	) {
		log.info({
			message: "Ignoring out-of-order Polar subscription event",
			organizationId: orgId,
			polarSubscriptionId,
			eventPeriodStart: periodStart.toISOString(),
			currentPeriodStart: billing.subscription.currentPeriodStart.toISOString(),
		});
		return { ok: true as const, organizationId: orgId };
	}

	const periodChanged =
		billing.credits.currentPeriodStart.getTime() !== periodStart.getTime();

	await db.transaction(async (tx) => {
		if (periodChanged) {
			await closeBillingPeriod({
				organizationId: orgId,
				periodStart: billing.credits.currentPeriodStart,
				periodEnd: billing.credits.currentPeriodEnd,
				planId: billing.plan.planId,
				includedEmails: billing.credits.monthlyCredits,
				emailsUsed: billing.credits.creditsUsed,
				tx,
			});
		}

		let monthlyEmails = billing.plan.monthlyEmails;
		if (incomingPlanId && incomingPlanId !== billing.plan.planId) {
			const next = await changeOrgPlan({
				organizationId: orgId,
				nextPlanId: incomingPlanId,
				tx,
			});
			monthlyEmails = next.monthlyEmails;
		}

		if (periodChanged) {
			await refillCreditsFromPlan({
				creditsId: billing.credits.id,
				organizationId: orgId,
				monthlyEmails,
				periodStart,
				periodEnd,
				tx,
			});
		} else if (incomingPlanId && incomingPlanId !== billing.plan.planId) {
			// Mid-period plan change: the new limit applies to this period, minus
			// what was already sent (upgrade adds room, downgrade caps it).
			await tx
				.update(organizationCredits)
				.set({
					monthlyCredits: monthlyEmails,
					creditsRemaining: Math.max(
						0,
						monthlyEmails - billing.credits.creditsUsed,
					),
					updatedAt: new Date(),
				})
				.where(eq(organizationCredits.id, billing.credits.id));
		}

		await tx
			.update(organizationSubscription)
			.set({
				planId: incomingPlanId ?? billing.plan.planId,
				status,
				polarSubscriptionId:
					polarSubscriptionId ?? billing.subscription.polarSubscriptionId,
				polarCustomerId:
					polarCustomerId ?? billing.subscription.polarCustomerId,
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
				cancelAtPeriodEnd,
				canceledAt,
				pastDueSince,
				updatedAt: new Date(),
			})
			.where(eq(organizationSubscription.id, billing.subscription.id));

		if (polarCustomerId) {
			await linkPolarCustomerToOrg({
				organizationId: orgId,
				polarCustomerId,
				tx,
			});
		}
	});

	return { ok: true as const, organizationId: orgId };
}
