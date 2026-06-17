import { authConfig } from "../auth.config";

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS = {
	free: { name: "Free", monthlyCredits: 500, priceUsd: "0" },
	starter: { name: "Starter", monthlyCredits: 10_000, priceUsd: "19" },
	growth: { name: "Growth", monthlyCredits: 50_000, priceUsd: "49" },
	scale: { name: "Scale", monthlyCredits: 250_000, priceUsd: "149" },
} as const;

export type PlanCode = keyof typeof PLANS;

export const PLAN_CREDITS: Record<PlanCode, number> = {
	free: 500,
	starter: 10_000,
	growth: 50_000,
	scale: 250_000,
};

// ─── Lago API client ──────────────────────────────────────────────────────────

const lagoFetch = async <T>(
	path: string,
	options: RequestInit = {},
): Promise<T> => {
	const res = await fetch(`${authConfig.LAGO_API_URL}/api/v1${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${authConfig.LAGO_API_KEY}`,
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Lago API error ${res.status}: ${body}`);
	}

	return res.json() as Promise<T>;
};

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface LagoCustomer {
	lago_id: string;
	external_id: string;
	name: string;
	email?: string;
}

export const lagoCreateCustomer = async (org: {
	id: string;
	name: string;
	billingEmail?: string | null;
	billingName?: string | null;
}): Promise<LagoCustomer> => {
	const data = await lagoFetch<{ customer: LagoCustomer }>("/customers", {
		method: "POST",
		body: JSON.stringify({
			customer: {
				external_id: org.id,
				name: org.billingName || org.name,
				email: org.billingEmail || undefined,
				currency: "USD",
			},
		}),
	});
	return data.customer;
};

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface LagoSubscription {
	lago_id: string;
	external_id: string;
	plan_code: string;
	status: string;
	started_at?: string;
	ending_at?: string;
}

export const lagoCreateSubscription = async (
	externalCustomerId: string,
	planCode: PlanCode,
): Promise<LagoSubscription> => {
	const externalId = `sub_${externalCustomerId}_${planCode}_${Date.now()}`;
	const data = await lagoFetch<{ subscription: LagoSubscription }>(
		"/subscriptions",
		{
			method: "POST",
			body: JSON.stringify({
				subscription: {
					external_customer_id: externalCustomerId,
					plan_code: planCode,
					external_id: externalId,
					billing_time: "calendar",
				},
			}),
		},
	);
	return data.subscription;
};

export const lagoUpgradeSubscription = async (
	externalSubscriptionId: string,
	newPlanCode: PlanCode,
): Promise<LagoSubscription> => {
	const data = await lagoFetch<{ subscription: LagoSubscription }>(
		`/subscriptions/${externalSubscriptionId}`,
		{
			method: "PUT",
			body: JSON.stringify({
				subscription: {
					plan_code: newPlanCode,
				},
			}),
		},
	);
	return data.subscription;
};

// ─── Usage events ─────────────────────────────────────────────────────────────

export const lagoIngestUsageEvent = async (
	organizationId: string,
	transactionId: string,
	quantity: number,
): Promise<void> => {
	await lagoFetch("/events", {
		method: "POST",
		body: JSON.stringify({
			event: {
				transaction_id: transactionId,
				external_customer_id: organizationId,
				code: "emails_sent",
				timestamp: Math.floor(Date.now() / 1000),
				properties: {
					recipient_count: quantity,
				},
			},
		}),
	});
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface LagoInvoice {
	lago_id: string;
	number: string;
	status: string;
	payment_status: string;
	total_amount_cents: number;
	currency: string;
	issuing_date: string;
	file_url?: string;
}

export const lagoListInvoices = async (
	externalCustomerId: string,
): Promise<LagoInvoice[]> => {
	const data = await lagoFetch<{ invoices: LagoInvoice[] }>(
		`/invoices?external_customer_id=${externalCustomerId}&per_page=20`,
	);
	return data.invoices;
};
