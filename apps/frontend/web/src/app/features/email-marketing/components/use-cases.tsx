import { Icon } from "@reloop/ui/icon";
import {
	type FeatureHighlight,
	FeatureHighlightsGrid,
} from "@reloop/web/components/landing/feature-highlights";

const marketingUseCases: FeatureHighlight[] = [
	{
		id: "newsletters",
		icon: "mail",
		title: "Newsletters",
		description:
			"Weekly or monthly broadcasts with reusable sections and per-link analytics.",
	},
	{
		id: "launches",
		icon: "rocket",
		title: "Product launches",
		description:
			"Announce features to the right segment with scheduled sends and A/B subjects.",
	},
	{
		id: "drips",
		icon: "refresh-cw",
		title: "Drip sequences",
		description:
			"Welcome and nurture flows triggered by signup, trial, or checkout events.",
	},
	{
		id: "segmentation",
		icon: "user-plus",
		title: "Segmentation",
		description:
			"Target engaged, dormant, or paying contacts without CSV exports.",
	},
	{
		id: "winback",
		icon: "magic-wand",
		title: "Win-back & upsell",
		description:
			"Re-engage churned users and expand accounts with offers that convert.",
	},
	{
		id: "ecommerce",
		icon: "invoice",
		title: "Ecommerce promos",
		description:
			"Abandoned-cart nudges, restocks, and seasonal sales with suppression baked in.",
	},
	{
		id: "events",
		icon: "calendar",
		title: "Events & webinars",
		description:
			"Invites, reminders, and follow-ups that keep show rates high.",
	},
	{
		id: "lifecycle",
		icon: "graph-up",
		title: "Lifecycle nurture",
		description:
			"Onboarding tips, activation nudges, and milestone check-ins on autopilot.",
	},
	{
		id: "deliverability",
		icon: "shield-check",
		title: "Deliverability guardrails",
		description:
			"List hygiene, bounces, and spam complaints handled automatically.",
	},
	{
		id: "analytics",
		icon: "layout",
		title: "Campaign analytics",
		description:
			"Opens, clicks, unsubscribes, and revenue per send — in real time.",
	},
];

export function UseCases() {
	return (
		<section
			id="use-cases"
			aria-labelledby="use-cases-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-200 border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24 dark:border-white/10">
				<div className="mb-3.5">
					<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-orange-50 px-2.5 py-1 font-medium text-[13px] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
						<Icon name="shapes" className="size-3.5" />
						Use Cases
					</span>
				</div>
				<h2
					id="use-cases-heading"
					className="mt-3.5 max-w-3xl text-balance font-medium text-4xl text-text-strong-950 leading-[1.05] tracking-tighter sm:text-5xl dark:text-white"
				>
					Built for every campaign.
				</h2>
			</div>
			<FeatureHighlightsGrid items={marketingUseCases} columns={5} />
		</section>
	);
}
