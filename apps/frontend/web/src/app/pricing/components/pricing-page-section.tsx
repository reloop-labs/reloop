"use client";

import { authClient } from "@reloop/auth/client";
import {
	isCheckoutPlanId,
	isPlanId,
	isValidCreditPackSize,
	type PlanId,
	pricingPlans,
} from "@reloop/pricing";
import {
	type PricingCtaOverride,
	type PricingCtaRequest,
	PricingUiProvider,
} from "@reloop/ui/pricing/cta";
import { PageSection } from "@reloop/web/components/page-shell";
import { type ReactNode, useEffect, useState } from "react";

const DASHBOARD_BILLING = "/dashboard/settings/billing";

function FlushSection({ children }: { children: ReactNode }) {
	return (
		<PageSection flushTop flushBottom>
			{children}
		</PageSection>
	);
}

/**
 * The plan of the signed-in visitor's active organization, or null when
 * signed out (or on a self-hosted instance with nothing to buy).
 */
function useCurrentPlan(): PlanId | null {
	const { data: session } = authClient.useSession();
	const [planId, setPlanId] = useState<PlanId | null>(null);
	const userId = session?.user?.id;

	useEffect(() => {
		if (!userId) {
			setPlanId(null);
			return;
		}
		let cancelled = false;
		fetch("/api/credits/v1/usage", { credentials: "include" })
			.then((res) => (res.ok ? res.json() : null))
			.then(
				(
					usage: {
						selfHosted?: boolean;
						plan?: { id?: string };
						subscription?: { planId?: string };
					} | null,
				) => {
					if (cancelled || !usage || usage.selfHosted) return;
					const id = usage.plan?.id ?? usage.subscription?.planId;
					setPlanId(id && isPlanId(id) ? id : "free");
				},
			)
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	return planId;
}

async function startCheckout(path: string, body: unknown): Promise<void> {
	const res = await fetch(path, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = (await res.json().catch(() => null)) as { url?: string } | null;
	if (!res.ok || !data?.url) throw new Error("Checkout failed");
	window.location.assign(data.url);
}

function planRank(id: PlanId): number {
	// Pay as you go is Free plus credits, so it ranks with Free.
	return pricingPlans.findIndex((p) => p.id === (id === "payg" ? "free" : id));
}

/**
 * Marketing layout for the shared pricing explorer. Signed-in visitors see
 * their current plan and go straight to checkout instead of sign-up.
 */
export function PricingPageSection({ children }: { children: ReactNode }) {
	const currentPlanId = useCurrentPlan();
	const [pending, setPending] = useState<string | null>(null);

	const run = (key: string, action: () => Promise<void>) => {
		setPending(key);
		action().catch(() => {
			// Fall back to the dashboard, where billing errors are explained.
			setPending(null);
			window.location.assign(`${DASHBOARD_BILLING}/plans`);
		});
	};

	const resolveCta = (
		request: PricingCtaRequest,
	): PricingCtaOverride | undefined => {
		if (!currentPlanId) return undefined;
		const { target } = request;
		const isPayg = currentPlanId === "payg";

		if (target === "credits") {
			const emails = request.volume ?? 0;
			const key = `credits:${request.placement}`;
			return {
				label:
					pending === key
						? "Redirecting…"
						: isPayg
							? "Buy more credits"
							: "Buy credits",
				disabled: pending != null || !isValidCreditPackSize(emails),
				onClick: () =>
					run(key, () =>
						startCheckout("/api/credits/v1/billing/credits/checkout", {
							emails,
						}),
					),
			};
		}

		if (
			target === "business" ||
			target === "enterprise" ||
			target === "dedicated-ip"
		) {
			return currentPlanId === target
				? { label: "Current plan", disabled: true }
				: undefined;
		}

		if (target === currentPlanId) {
			return { label: "Current plan", disabled: true };
		}

		if (target === "free") {
			if (isPayg) return { label: "Included", disabled: true };
			return {
				label: "Manage plan",
				onClick: () => window.location.assign(DASHBOARD_BILLING),
			};
		}

		if (isCheckoutPlanId(target)) {
			const key = `plan:${target}:${request.placement}`;
			const isUpgrade = planRank(target) > planRank(currentPlanId);
			return {
				label:
					pending === key
						? "Redirecting…"
						: isUpgrade
							? "Upgrade"
							: "Downgrade",
				disabled: pending != null,
				onClick: () =>
					run(key, () =>
						startCheckout("/api/credits/v1/billing/checkout", {
							planId: target,
						}),
					),
			};
		}

		return undefined;
	};

	return (
		<PricingUiProvider Section={FlushSection} resolveCta={resolveCta}>
			{children}
		</PricingUiProvider>
	);
}
