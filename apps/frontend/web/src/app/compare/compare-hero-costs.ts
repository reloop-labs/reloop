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

function contactsFor100k(): number {
	return Math.round(100_000 / marketingSendsPerContact);
}

/** The one volume each hand-written compare page leads with, in its hero and card. */
const SPOTLIGHT_VOLUMES: Record<string, { mode: CostMode; volume: number }> = {
	resend: { mode: "transactional", volume: 100_000 },
	mailgun: { mode: "transactional", volume: 100_000 },
	sendgrid: { mode: "transactional", volume: 100_000 },
	"aws-ses": { mode: "transactional", volume: 100_000 },
	postmark: { mode: "transactional", volume: 100_000 },
	// Contact-priced: the list that one weekly campaign turns into 100,000 emails a month.
	loops: { mode: "marketing", volume: contactsFor100k() },
	mailchimp: { mode: "marketing", volume: contactsFor100k() },
};

export type CostSpotlight = {
	mode: CostMode;
	volume: number;
	/** "100,000 emails a month", plus the list size for contact-priced providers. */
	volumeLabel: string;
	reloop: CostRow;
	competitor: CostRow;
	/** Set when the competitor's price isn't in US dollars. */
	competitorCurrency?: "EUR";
	/** "June 2026" when the price comes from a "Reloop vs X" post instead of costsCheckedAt. */
	checkedAt?: string;
};

/** Reloop vs one provider at that provider's spotlight volume, or null when we have no verified prices. */
export function getCostSpotlight(providerId: string): CostSpotlight | null {
	const spot = SPOTLIGHT_VOLUMES[providerId];
	if (!spot) return null;
	const rows = quoteCosts(spot.mode, spot.volume);
	const reloop = rows.find((row) => row.id === "reloop");
	const competitor = rows.find((row) => row.id === providerId);
	if (!reloop || !competitor) return null;
	const format = new Intl.NumberFormat("en-US").format;
	const count = format(spot.volume);
	return {
		...spot,
		volumeLabel:
			spot.mode === "marketing"
				? `${format(Math.round((spot.volume * marketingSendsPerContact) / 1000) * 1000)} emails a month: a weekly campaign to about ${format(Math.round(spot.volume / 1000) * 1000)} contacts`
				: `${count} emails a month`,
		reloop,
		competitor,
	};
}

type PostQuote = CostQuote & {
	currency?: "EUR";
	/** When the price was read from the competitor's site instead of the post. */
	checkedAt?: string;
};

/**
 * Competitors without a hand-written page: their price at 100,000 emails a month,
 * as stated in the "Reloop vs X" blog post. Keep in step with those posts.
 */
const POST_QUOTES_100K: Record<string, PostQuote> = {
	agentmail: { plan: "Startup", usd: 200 },
	// Starter base $9 + $73 for the 80,001-100,000 email credits tier, from brevo.com/pricing.md.
	brevo: { plan: "Starter", usd: 82, checkedAt: costsCheckedAt },
	"cloudflare-email": {
		plan: "Workers Paid, $5 + $0.35 per 1,000",
		usd: 39,
	},
	// Priced per profile: Essentials includes 5,000 profiles and 1M emails.
	"customer-io": { plan: "Essentials, up to 5,000 profiles", usd: 100 },
	// The 100,000 step of the Email API Starter slider on elasticemail.com.
	"elastic-email": {
		plan: "Email API Starter",
		usd: 29,
		checkedAt: costsCheckedAt,
	},
	lettermint: { plan: "Starter", usd: 85, currency: "EUR" },
	mailersend: { plan: "Starter", usd: 68 },
	listmonk: {
		plan: "Self-hosted software. You pay for a server and an SMTP provider",
		usd: 0,
	},
	mailjet: { plan: "Premium", usd: 112 },
	mailpace: { plan: "Its only plan, $10 + $1 per 1,000", usd: 100 },
	mailtrap: { plan: "Basic", usd: 30 },
	mandrill: { plan: "Email blocks, plus a Mailchimp plan", usd: 80 },
	plunk: { plan: "Pay as you go", usd: 100 },
	postal: {
		plan: "Self-hosted software. You pay for the server and its IPs",
		usd: 0,
	},
	smtp2go: { plan: "Professional", usd: 75 },
	sparkpost: { plan: "Startup", usd: 40 },
	sweego: { plan: "Startup", usd: 79, currency: "EUR" },
	usesend: { plan: "Pay as you go", usd: 40 },
	zeptomail: { plan: "Prepaid credits", usd: 25 },
};

const POST_VOLUME = 100_000;

/** "2026-06-04" -> "June 2026" */
function monthYear(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}

/** Reloop vs a blog-only competitor at 100,000 emails a month, or null when its post states no price. */
export function getPostSpotlight(
	slug: string,
	competitorName: string,
	publishedAt?: string,
): CostSpotlight | null {
	const quote = POST_QUOTES_100K[slug];
	const reloop = quoteCosts("transactional", POST_VOLUME).find(
		(row) => row.id === "reloop",
	);
	if (!quote || !reloop) return null;
	return {
		mode: "transactional",
		volume: POST_VOLUME,
		volumeLabel: "100,000 emails a month",
		reloop,
		competitor: {
			id: slug,
			name: competitorName,
			plan: quote.plan,
			usd: quote.usd,
		},
		competitorCurrency: quote.currency,
		checkedAt:
			quote.checkedAt ?? (publishedAt ? monthYear(publishedAt) : undefined),
	};
}

/** The competitor's price as shown on cards: "$35", "€85" or "Free". */
export function formatCompetitorPrice(spotlight: CostSpotlight): string {
	return spotlight.competitorCurrency === "EUR"
		? `€${spotlight.competitor.usd}`
		: formatUsd(spotlight.competitor.usd);
}
