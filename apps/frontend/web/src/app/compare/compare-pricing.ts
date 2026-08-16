import { formatPrice, pricingPlans } from "@reloop/web/lib/pricing";

export type ComparePriceCell = {
	value: string;
	note?: string;
};

export type ComparePriceRow = {
	id: string;
	label: string;
	reloop: ComparePriceCell;
	competitor: ComparePriceCell;
};

export type ComparePricing = {
	model: string;
	rows: ComparePriceRow[];
};

const reloopFree = pricingPlans.find((plan) => plan.id === "free");
const reloopIndividual = pricingPlans.find((plan) => plan.id === "individual");
const reloopStartup = pricingPlans.find((plan) => plan.id === "startup");

const reloopFreeValue = formatPrice(reloopFree?.monthlyPrice ?? 0);
const reloopFreeNote = `${reloopFree?.emailsLabel ?? "3,000 emails / month"} · ${reloopFree?.comparison.dailyLimit ?? "200"} / day`;
const reloopEntryValue = `${formatPrice(reloopIndividual?.monthlyPrice ?? 10)} / mo`;
const reloopEntryNote =
	reloopIndividual?.emailsLabel ?? "25,000 emails / month";
const reloopMidValue = `${formatPrice(reloopStartup?.monthlyPrice ?? 20)} / mo`;
const reloopMidNote = reloopStartup?.emailsLabel ?? "50,000 emails / month";
const reloopOverage = reloopIndividual?.comparison.overage ?? "$0.80 / 1k";

const reloopSendRows = {
	model: "Pay per email sent",
	free: {
		value: reloopFreeValue,
		note: reloopFreeNote,
	},
	entry: {
		value: reloopEntryValue,
		note: reloopEntryNote,
	},
	mid: {
		value: reloopMidValue,
		note: reloopMidNote,
	},
	extra: {
		value: reloopOverage,
		note: "After included volume",
	},
	selfHost: {
		value: "$0 software",
		note: "Unlimited on your infra",
	},
} as const;

function sendRows(
	competitor: Record<
		"free" | "entry" | "mid" | "extra" | "selfHost",
		ComparePriceCell
	>,
	midLabel = "50,000 emails",
): ComparePriceRow[] {
	return [
		{
			id: "free",
			label: "Free",
			reloop: reloopSendRows.free,
			competitor: competitor.free,
		},
		{
			id: "entry",
			label: "Entry paid",
			reloop: reloopSendRows.entry,
			competitor: competitor.entry,
		},
		{
			id: "mid",
			label: midLabel,
			reloop: reloopSendRows.mid,
			competitor: competitor.mid,
		},
		{
			id: "extra",
			label: "Extra emails",
			reloop: reloopSendRows.extra,
			competitor: competitor.extra,
		},
		{
			id: "self-host",
			label: "Self-host",
			reloop: reloopSendRows.selfHost,
			competitor: competitor.selfHost,
		},
	];
}

const hostedOnly: ComparePriceCell = {
	value: "Not available",
	note: "Hosted SaaS only",
};

/**
 * Public list prices for the competitor on each /compare/[slug] page.
 * Reloop cells come from @reloop/pricing so they stay in sync with /pricing.
 */
const COMPETITOR_PRICING: Record<string, ComparePricing> = {
	Resend: {
		model: reloopSendRows.model,
		rows: sendRows({
			free: {
				value: "$0",
				note: "3,000 emails / mo · 100 / day",
			},
			entry: {
				value: "$20 / mo",
				note: "50,000 emails · no $10 plan",
			},
			mid: {
				value: "$20 / mo",
				note: "50,000 emails included",
			},
			extra: {
				value: "$0.90 / 1k",
				note: "Pro overage",
			},
			selfHost: hostedOnly,
		}),
	},
	SendGrid: {
		model: reloopSendRows.model,
		rows: sendRows({
			free: {
				value: "$0",
				note: "100 emails / day · 60-day trial",
			},
			entry: {
				value: "$19.95 / mo",
				note: "Essentials · 50,000 emails",
			},
			mid: {
				value: "$19.95 / mo",
				note: "Essentials · 50,000 emails",
			},
			extra: {
				value: "$34.95 / mo",
				note: "Essentials at 100,000 emails",
			},
			selfHost: hostedOnly,
		}),
	},
	Mailgun: {
		model: reloopSendRows.model,
		rows: sendRows({
			free: {
				value: "$0",
				note: "100 emails / day",
			},
			entry: {
				value: "$15 / mo",
				note: "Basic · 10,000 emails",
			},
			mid: {
				value: "$35 / mo",
				note: "Foundation · 50,000 emails",
			},
			extra: {
				value: "From $1.30 / 1k",
				note: "Foundation overage; Basic from $1.80 / 1k",
			},
			selfHost: hostedOnly,
		}),
	},
	Postmark: {
		model: reloopSendRows.model,
		rows: sendRows({
			free: {
				value: "$0",
				note: "100 emails / mo · no overage",
			},
			entry: {
				value: "$15 / mo",
				note: "Basic · 10,000 emails",
			},
			mid: {
				value: "$15 + extra",
				note: "No published 50k plan · $1.80 / 1k on Basic",
			},
			extra: {
				value: "$1.80 / 1k",
				note: "Basic overage · Pro $1.30 / 1k",
			},
			selfHost: hostedOnly,
		}),
	},
	"AWS SES": {
		model: "Platform vs send-only",
		rows: [
			{
				id: "free",
				label: "Free",
				reloop: reloopSendRows.free,
				competitor: {
					value: "62,000 / mo",
					note: "From EC2 in the same region · first 12 months",
				},
			},
			{
				id: "entry",
				label: "List price",
				reloop: reloopSendRows.entry,
				competitor: {
					value: "$0.10 / 1k",
					note: "Plus data transfer",
				},
			},
			{
				id: "mid",
				label: "50,000 emails",
				reloop: reloopSendRows.mid,
				competitor: {
					value: "~$5 + transfer",
					note: "Sending only · no product UI",
				},
			},
			{
				id: "extra",
				label: "Extra emails",
				reloop: reloopSendRows.extra,
				competitor: {
					value: "$0.10 / 1k",
					note: "Plus $0.12 / GB outbound",
				},
			},
			{
				id: "included",
				label: "What's included",
				reloop: {
					value: "Full platform",
					note: "API, campaigns, inbox, templates",
				},
				competitor: {
					value: "Sending pipe",
					note: "You assemble SNS, UI, and campaigns",
				},
			},
			{
				id: "self-host",
				label: "Self-host",
				reloop: reloopSendRows.selfHost,
				competitor: {
					value: "AWS-managed",
					note: "SES only · no self-hosted product",
				},
			},
		],
	},
	Loops: {
		model: "Pay per send vs per contact",
		rows: [
			{
				id: "free",
				label: "Free",
				reloop: reloopSendRows.free,
				competitor: {
					value: "$0",
					note: "1,000 contacts · 4,000 sends / mo",
				},
			},
			{
				id: "entry",
				label: "Entry paid",
				reloop: reloopSendRows.entry,
				competitor: {
					value: "$49 / mo",
					note: "5,000 subscribed contacts",
				},
			},
			{
				id: "mid",
				label: "At 50,000",
				reloop: {
					value: reloopSendRows.mid.value,
					note: "50,000 emails sent",
				},
				competitor: {
					value: "$199 / mo",
					note: "50,000 contacts stored",
				},
			},
			{
				id: "extra",
				label: "Overage",
				reloop: reloopSendRows.extra,
				competitor: {
					value: "Contact tiers",
					note: "Bill rises with list size · paid sends uncapped",
				},
			},
			{
				id: "self-host",
				label: "Self-host",
				reloop: reloopSendRows.selfHost,
				competitor: hostedOnly,
			},
		],
	},
	Mailchimp: {
		model: "Pay per send vs per contact",
		rows: [
			{
				id: "free",
				label: "Free",
				reloop: reloopSendRows.free,
				competitor: {
					value: "$0",
					note: "250 contacts · 500 sends / mo",
				},
			},
			{
				id: "entry",
				label: "Entry paid",
				reloop: reloopSendRows.entry,
				competitor: {
					value: "$13 / mo",
					note: "Essentials · 500 contacts",
				},
			},
			{
				id: "mid",
				label: "At 50,000",
				reloop: {
					value: reloopSendRows.mid.value,
					note: "50,000 emails sent",
				},
				competitor: {
					value: "$385 / mo",
					note: "Essentials · 50,000 contacts",
				},
			},
			{
				id: "extra",
				label: "Overage",
				reloop: reloopSendRows.extra,
				competitor: {
					value: "Contact + send caps",
					note: "Essentials send cap is 10× contacts",
				},
			},
			{
				id: "self-host",
				label: "Self-host",
				reloop: reloopSendRows.selfHost,
				competitor: hostedOnly,
			},
		],
	},
};

const FALLBACK_PRICING: ComparePricing = {
	model: reloopSendRows.model,
	rows: sendRows({
		free: { value: "See their site" },
		entry: { value: "See their site" },
		mid: { value: "See their site" },
		extra: { value: "See their site" },
		selfHost: hostedOnly,
	}),
};

export function getComparePricing(competitorName: string): ComparePricing {
	return COMPETITOR_PRICING[competitorName] ?? FALLBACK_PRICING;
}
