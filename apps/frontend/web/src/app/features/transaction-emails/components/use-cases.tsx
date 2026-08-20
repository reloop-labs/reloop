import {
	type FeatureHighlight,
	FeatureHighlightsGrid,
} from "@reloop/web/components/landing/feature-highlights";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";

const transactionalUseCases: FeatureHighlight[] = [
	{
		id: "auth-otp",
		icon: "key",
		title: "Auth & OTP codes",
		description:
			"Deliver time-critical one-time passwords and verification links in sub-seconds.",
	},
	{
		id: "magic-links",
		icon: "zap",
		title: "Passwordless login",
		description:
			"Instant authentication magic links that reliably land in the primary inbox.",
	},
	{
		id: "security-alerts",
		icon: "shield",
		title: "Security notifications",
		description:
			"Immediate alerts for new logins, password updates, and 2FA credential changes.",
	},
	{
		id: "invoices-receipts",
		icon: "lock",
		title: "Billing & invoices",
		description:
			"Payment confirmations, subscription renewal receipts, and automated PDF delivery.",
	},
	{
		id: "welcome-onboarding",
		icon: "send-2",
		title: "Welcome onboarding",
		description:
			"Trigger automated welcome sequences the moment a user creates an account.",
	},
	{
		id: "team-invites",
		icon: "verified",
		title: "Team invitations",
		description:
			"Collaborative organization invites with customized permission roles and expiry rules.",
	},
	{
		id: "system-alerts",
		icon: "activity",
		title: "System & cron alerts",
		description:
			"Real-time developer alerts for pipeline anomalies, quota limits, and webhook events.",
	},
	{
		id: "activity-digests",
		icon: "layout",
		title: "Activity digests",
		description:
			"Scheduled daily and weekly summaries of product engagement and team activity.",
	},
	{
		id: "inbound-routing",
		icon: "mail-receive",
		title: "Inbound email routing",
		description:
			"Receive incoming replies directly into your app and trigger automated webhooks.",
	},
	{
		id: "lifecycle-events",
		icon: "server",
		title: "Account lifecycle",
		description:
			"Data export downloads, compliance requests, and organization updates.",
	},
];

export function UseCases() {
	return (
		<section
			id="use-cases"
			aria-labelledby="use-cases-heading"
			className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black"
		>
			<div className="border-stroke-soft-200 border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24 dark:border-white/10">
				<div className="flex items-center gap-2">
					<SceneGlyph icon="shapes" color="orange" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Use Cases
					</span>
				</div>
				<h2
					id="use-cases-heading"
					className="mt-3.5 max-w-3xl font-medium text-4xl text-text-strong-950 text-balance leading-[1.05] tracking-tighter sm:text-5xl dark:text-white"
				>
					Built for every critical email.
				</h2>
			</div>
			<FeatureHighlightsGrid items={transactionalUseCases} columns={5} />
		</section>
	);
}
