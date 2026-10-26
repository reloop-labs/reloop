import {
	paidOverageUsdPerThousand,
	pricingPlans,
} from "@reloop/web/lib/pricing";

export type CostMode = "transactional" | "marketing";

export type CostQuote = {
	plan: string;
	usd: number;
};

export type CostProvider = {
	id: string;
	name: string;
	quote: (volume: number) => CostQuote;
};

export type CostPreset = {
	label: string;
	value: number;
};

export type CostModeConfig = {
	label: string;
	title: string;
	subtitle: string;
	sliderLabel: string;
	unit: string;
	presets: CostPreset[];
	defaultValue: number;
	providers: CostProvider[];
	footnote: string;
};

/** Prices were read from each provider's public pricing page in this month. */
export const costsCheckedAt = "October 2026";

/** One campaign a week: 52 sends a year spread over 12 months. */
export const marketingSendsPerContact = 4.3;

type Tier = { upTo: number; plan: string; usd: number };

/** Cheapest published tier that covers the volume, else the largest one. */
function fromTiers(tiers: Tier[], volume: number): CostQuote {
	const tier =
		tiers.find((candidate) => volume <= candidate.upTo) ?? tiers.at(-1);
	return { plan: tier?.plan ?? "Custom", usd: tier?.usd ?? 0 };
}

type BaseWithOverage = {
	plan: string;
	usd: number;
	included: number;
	perThousand: number;
};

/** Cheapest base plan once overage on top of its included volume is added. */
function cheapestWithOverage(
	plans: BaseWithOverage[],
	volume: number,
): CostQuote {
	let best: CostQuote = { plan: "Custom", usd: Number.POSITIVE_INFINITY };
	for (const plan of plans) {
		const extra = Math.max(0, volume - plan.included) / 1000;
		const usd = plan.usd + extra * plan.perThousand;
		if (usd < best.usd) best = { plan: plan.plan, usd };
	}
	return best;
}

function includedEmails(label: string): number {
	return Number(label.replace(/,/g, ""));
}

/** Reloop Cloud, straight from @reloop/pricing so it matches /pricing. */
function reloopQuote(sends: number): CostQuote {
	const free = pricingPlans.find((plan) => plan.id === "free");
	if (sends <= includedEmails(free?.comparison.monthlyEmails ?? "6000")) {
		return { plan: free?.name ?? "Free", usd: 0 };
	}
	const paid = pricingPlans.flatMap((plan) => {
		if (!plan.monthlyPrice) return [];
		const included = includedEmails(plan.comparison.monthlyEmails);
		if (!Number.isFinite(included)) return [];
		return [
			{
				plan: plan.name,
				usd: plan.monthlyPrice,
				included,
				perThousand: paidOverageUsdPerThousand,
			},
		];
	});
	const best = cheapestWithOverage(paid, sends);
	return { plan: best.plan, usd: Math.round(best.usd) };
}

const reloopTransactional: CostProvider = {
	id: "reloop",
	name: "Reloop",
	quote: reloopQuote,
};

const reloopMarketing: CostProvider = {
	id: "reloop",
	name: "Reloop",
	quote: (contacts) =>
		reloopQuote(Math.round(contacts * marketingSendsPerContact)),
};

const transactionalProviders: CostProvider[] = [
	reloopTransactional,
	{
		id: "resend",
		name: "Resend",
		quote: (emails) =>
			fromTiers(
				[
					{ upTo: 3_000, plan: "Free", usd: 0 },
					{ upTo: 50_000, plan: "Pro", usd: 20 },
					{ upTo: 100_000, plan: "Pro", usd: 35 },
					{ upTo: 200_000, plan: "Scale", usd: 160 },
					{ upTo: 500_000, plan: "Scale", usd: 350 },
					{ upTo: 1_000_000, plan: "Scale", usd: 650 },
					{ upTo: 1_500_000, plan: "Scale", usd: 825 },
					{ upTo: 2_500_000, plan: "Scale", usd: 1150 },
				],
				emails,
			),
	},
	{
		id: "sendgrid",
		name: "SendGrid",
		quote: (emails) =>
			fromTiers(
				[
					{ upTo: 50_000, plan: "Essentials", usd: 19.95 },
					{ upTo: 100_000, plan: "Essentials", usd: 34.95 },
					{ upTo: 300_000, plan: "Pro", usd: 249 },
					{ upTo: 700_000, plan: "Pro", usd: 499 },
					{ upTo: 1_500_000, plan: "Pro", usd: 799 },
				],
				emails,
			),
	},
	{
		id: "mailgun",
		name: "Mailgun",
		quote: (emails) =>
			cheapestWithOverage(
				[
					{ plan: "Basic", usd: 15, included: 10_000, perThousand: 1.8 },
					{
						plan: "Foundation",
						usd: 35,
						included: 50_000,
						perThousand: 1.3,
					},
					{ plan: "Scale", usd: 90, included: 100_000, perThousand: 1.1 },
				],
				emails,
			),
	},
	{
		id: "postmark",
		name: "Postmark",
		quote: (emails) =>
			fromTiers(
				[
					{ upTo: 10_000, plan: "Basic", usd: 15 },
					{ upTo: 50_000, plan: "Basic", usd: 55 },
					{ upTo: 125_000, plan: "Basic", usd: 115 },
					{ upTo: 300_000, plan: "Basic", usd: 245 },
					{ upTo: 600_000, plan: "Basic", usd: 455 },
					{ upTo: 1_200_000, plan: "Basic", usd: 775 },
				],
				emails,
			),
	},
	{
		id: "aws-ses",
		name: "AWS SES",
		quote: (emails) => ({
			plan: "Pay as you go",
			usd: (emails / 1000) * 0.1,
		}),
	},
];

const marketingProviders: CostProvider[] = [
	reloopMarketing,
	{
		id: "kit",
		name: "Kit",
		quote: (contacts) =>
			fromTiers(
				[
					{ upTo: 10_000, plan: "Newsletter", usd: 0 },
					{ upTo: 25_000, plan: "Creator", usd: 199 },
					{ upTo: 50_000, plan: "Creator", usd: 379 },
					{ upTo: 100_000, plan: "Creator", usd: 679 },
				],
				contacts,
			),
	},
	{
		id: "loops",
		name: "Loops",
		// Free stops at 4,000 sends a month, which a weekly 1,000-contact list passes.
		quote: (contacts) =>
			contacts * marketingSendsPerContact <= 4_000 && contacts <= 1_000
				? { plan: "Free", usd: 0 }
				: fromTiers(
						[
							{ upTo: 5_000, plan: "Paid", usd: 49 },
							{ upTo: 10_000, plan: "Paid", usd: 99 },
							{ upTo: 25_000, plan: "Paid", usd: 199 },
							{ upTo: 50_000, plan: "Paid", usd: 249 },
							{ upTo: 100_000, plan: "Paid", usd: 399 },
						],
						contacts,
					),
	},
	{
		id: "resend",
		name: "Resend",
		quote: (contacts) =>
			fromTiers(
				[
					{ upTo: 1_000, plan: "Free", usd: 0 },
					{ upTo: 5_000, plan: "Pro Marketing", usd: 40 },
					{ upTo: 10_000, plan: "Pro Marketing", usd: 80 },
					{ upTo: 15_000, plan: "Pro Marketing", usd: 120 },
					{ upTo: 25_000, plan: "Pro Marketing", usd: 180 },
					{ upTo: 50_000, plan: "Pro Marketing", usd: 250 },
					{ upTo: 100_000, plan: "Pro Marketing", usd: 450 },
				],
				contacts,
			),
	},
	{
		id: "mailchimp",
		name: "Mailchimp",
		quote: (contacts) =>
			fromTiers(
				[
					{ upTo: 500, plan: "Essentials", usd: 13 },
					{ upTo: 5_000, plan: "Essentials", usd: 75 },
					{ upTo: 10_000, plan: "Essentials", usd: 110 },
					{ upTo: 25_000, plan: "Essentials", usd: 270 },
					{ upTo: 50_000, plan: "Essentials", usd: 385 },
					{ upTo: 100_000, plan: "Standard", usd: 800 },
				],
				contacts,
			),
	},
];

export const costModes: Record<CostMode, CostModeConfig> = {
	transactional: {
		label: "Transactional",
		title: "Transactional email.",
		subtitle: "API and system-triggered messaging.",
		sliderLabel: "Monthly email volume",
		unit: "/ mo",
		presets: [
			{ label: "10k", value: 10_000 },
			{ label: "25k", value: 25_000 },
			{ label: "50k", value: 50_000 },
			{ label: "100k", value: 100_000 },
			{ label: "250k", value: 250_000 },
			{ label: "500k", value: 500_000 },
			{ label: "1M", value: 1_000_000 },
		],
		defaultValue: 100_000,
		providers: transactionalProviders,
		footnote: `The cheapest plan that covers the volume, monthly billing in US dollars, from each pricing page in ${costsCheckedAt}. AWS SES is the sending pipe only: no dashboard, templates or contacts.`,
	},
	marketing: {
		label: "Marketing",
		title: "Marketing email.",
		subtitle: "Broadcasts, audiences, and campaigns.",
		sliderLabel: "Audience contacts",
		unit: "contacts",
		presets: [
			{ label: "5k", value: 5_000 },
			{ label: "10k", value: 10_000 },
			{ label: "25k", value: 25_000 },
			{ label: "50k", value: 50_000 },
			{ label: "75k", value: 75_000 },
			{ label: "100k", value: 100_000 },
		],
		defaultValue: 50_000,
		providers: marketingProviders,
		footnote: `The cheapest plan that fits the list, one campaign a week (about ${marketingSendsPerContact} emails per contact a month), monthly billing in US dollars, from each pricing page in ${costsCheckedAt}. Reloop bills per email sent, with unlimited contacts.`,
	},
};

export type CostRow = CostQuote & { id: string; name: string };

/** Quotes for every provider in a mode, cheapest first. */
export function quoteCosts(mode: CostMode, volume: number): CostRow[] {
	return costModes[mode].providers
		.map((provider) => ({
			id: provider.id,
			name: provider.name,
			...provider.quote(volume),
		}))
		.sort((a, b) => a.usd - b.usd);
}

export function formatUsd(usd: number): string {
	if (usd === 0) return "Free";
	const cents = Math.round(usd * 100) % 100 !== 0;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: cents ? 2 : 0,
		maximumFractionDigits: cents ? 2 : 0,
	}).format(usd);
}

/** The one volume each hand-written compare page leads with, in its hero and card. */
const SPOTLIGHT_VOLUMES: Record<string, { mode: CostMode; volume: number }> = {
	resend: { mode: "transactional", volume: 100_000 },
	mailgun: { mode: "transactional", volume: 100_000 },
	sendgrid: { mode: "transactional", volume: 100_000 },
	"aws-ses": { mode: "transactional", volume: 100_000 },
	postmark: { mode: "transactional", volume: 100_000 },
	loops: { mode: "marketing", volume: 10_000 },
	mailchimp: { mode: "marketing", volume: 10_000 },
};

export type CostSpotlight = {
	mode: CostMode;
	volume: number;
	/** "100,000 emails a month" or "10,000 contacts, one campaign a week". */
	volumeLabel: string;
	reloop: CostRow;
	competitor: CostRow;
};

/** Reloop vs one provider at that provider's spotlight volume, or null when we have no verified prices. */
export function getCostSpotlight(providerId: string): CostSpotlight | null {
	const spot = SPOTLIGHT_VOLUMES[providerId];
	if (!spot) return null;
	const rows = quoteCosts(spot.mode, spot.volume);
	const reloop = rows.find((row) => row.id === "reloop");
	const competitor = rows.find((row) => row.id === providerId);
	if (!reloop || !competitor) return null;
	const count = new Intl.NumberFormat("en-US").format(spot.volume);
	return {
		...spot,
		volumeLabel:
			spot.mode === "marketing"
				? `${count} contacts, one campaign a week`
				: `${count} emails a month`,
		reloop,
		competitor,
	};
}
