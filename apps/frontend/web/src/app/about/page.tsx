import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/about`;
const pageTitle = "About Reloop | Open Source Email Infrastructure";
const pageDescription =
	"Reloop is open-source, self-hostable email infrastructure for developers and agents. Same software whether you self-host or use Reloop Cloud.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"About Reloop",
		"open source email",
		"email infrastructure",
		"self-hosted email",
		"Reloop Labs",
		"transparent email infrastructure",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const AboutPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "AboutPage",
		mainEntity: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
			logo: `${siteUrl}/web-app-manifest-512x512.png`,
			description:
				"Open-source, self-hostable email infrastructure with a hosted service at reloop.sh.",
			founders: [
				{
					"@type": "Person",
					name: "Pranav Patel",
					sameAs: "https://github.com/pranavp10",
				},
				{
					"@type": "Person",
					name: "Twinkal P",
					sameAs: "https://github.com/twinkalp10",
				},
			],
			sameAs: [
				socialProfiles.github,
				socialProfiles.discord,
				socialProfiles.x,
			],
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			<div className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-2xl flex-col px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
				{/* Title in Instrument Serif */}
				<h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] text-text-strong-950 tracking-tight leading-none dark:text-white">
					About Reloop
				</h1>

				{/* Essay Body */}
				<div className="mt-10 space-y-6 sm:space-y-7 text-[16px] sm:text-[17.5px] leading-[1.8] text-neutral-700 dark:text-neutral-300 font-normal">
					<p>
						Reloop — <strong>Re</strong>liable, Open-<strong>Loop</strong> Email Infrastructure.
					</p>

					<p>
						The name is a nod to closed-loop feedback systems: the idea that every transactional send, retry, bounce, and webhook should be observable, deterministic, and verifiable in code. Incumbent email platforms turned routing into a black box — proprietary deliverability scores, uninspectable queues, and escalating volume tiers.
					</p>

					<p>
						We think infrastructure belongs in the open. For decades, the foundations of the internet — Linux, Postgres, Redis, and Nginx — have succeeded because they are transparent, self-hostable, and predictable. Email belongs in that exact same category: when it fails, users can&apos;t log in, can&apos;t reset passwords, and can&apos;t receive receipts.
					</p>

					<p>
						In Reloop, open source is not a stripped-down demo or an enterprise bait-and-switch. Reloop Cloud and Reloop open source are the exact same product. The same transactional APIs, the same high-speed SMTP relays, the same inbound webhooks, and the same deliverability engines — whether you deploy on your own servers with Docker Compose or send from reloop.sh.
					</p>

					<p>
						Like the open-source tools before it, the bet is on developer sovereignty: a small team shouldn&apos;t be locked into proprietary platforms. With the right architecture, two engineers and a fleet of agents can ship email infrastructure that scales to millions.
					</p>

					<p>
						The platform is fully open source and self-hostable. Your data stays on your infrastructure. Inspect every line, extend the API, customize your routing, and contribute back to the community.
					</p>

					{/* GitHub CTA Button */}
					<div className="pt-4">
						<a
							href={socialProfiles.github}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2.5 rounded-xl bg-black px-6 py-3.5 font-medium text-sm text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
						>
							<svg
								className="size-5 shrink-0"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								/>
							</svg>
							<span>View on GitHub</span>
						</a>
					</div>
				</div>
			</div>
		</>
	);
};

export default AboutPage;
