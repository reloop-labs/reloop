import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
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

const sketch =
	"fill-none stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]";

function SmtpSendDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 150 175"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* envelope */}
				<path d="M14 22 L66 20 L64 58 L12 60 Z M14 22 L40 42 L66 20" />
				<path d="M16 66 h44 M16 72 h32" />
				{/* send arrow */}
				<path d="M72 40 h28 M92 32 l8 8 -8 8" strokeDasharray="3 4" />
				{/* server stack */}
				<path d="M104 18 L142 24 L138 132 L100 128 Z" />
				<path d="M104 18 L106 30 M142 24 L140 36 M102 28 L141 34" />
				<rect x="108" y="44" width="24" height="10" rx="2" />
				<rect x="108" y="60" width="24" height="10" rx="2" />
				<rect x="107" y="76" width="24" height="10" rx="2" />
				<circle cx="112" cy="49" r="1.6" fill="currentColor" />
				<circle cx="112" cy="65" r="1.6" fill="currentColor" />
				<circle cx="112" cy="81" r="1.6" fill="currentColor" />
				<path d="M118 49 h10 M118 65 h10 M117 81 h10" />
				{/* queue waves + 250 OK check */}
				<path d="M106 100 c 4 -3, 8 2, 12 0 M122 102 c 4 -3, 8 2, 10 0 M14 148 L80 144 M80 144 l-8 -4 M80 144 l-8 4" />
				<path d="M88 136 l6 6 10 -12" />
			</g>
		</svg>
	);
}

function ServerRackDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 72 292"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* rack cabinet */}
				<path d="M12 8 L60 10 L56 274 L8 272 Z M12 8 L14 22 M60 10 L58 24 M10 20 L60 22" />
				{/* unit 1 */}
				<rect x="16" y="34" width="40" height="26" rx="2" />
				<circle cx="22" cy="42" r="2" fill="currentColor" />
				<circle cx="22" cy="50" r="1.5" />
				<path d="M30 42 h20 M30 48 h20 M30 54 h14" />
				{/* unit 2 */}
				<rect x="16" y="70" width="40" height="26" rx="2" />
				<circle cx="22" cy="78" r="2" fill="currentColor" />
				<path d="M30 78 h20 M30 84 h20 M30 90 h14" />
				{/* unit 3 */}
				<rect x="15" y="106" width="40" height="26" rx="2" />
				<circle cx="21" cy="114" r="2" fill="currentColor" />
				<path d="M29 114 h20 M29 120 h20 M29 126 h14" />
				{/* switch */}
				<path d="M18 148 l6 6 10 -12" />
				<path d="M16 162 h38 M16 170 h30" />
				{/* db cylinder */}
				<path d="M20 190 c 0 -5, 28 -5, 28 0 l-2 34 c 0 5, -24 5, -24 0 Z M20 190 c 0 5, 28 5, 28 0" />
				<path d="M22 206 c 6 3, 20 3, 24 0" />
				{/* cables */}
				<path d="M28 224 c -2 14, 10 12, 8 26 M40 224 c 4 12, -6 18, 2 30 M18 272 L54 273" />
				<path d="M50 240 l8 4 -4 8" />
			</g>
		</svg>
	);
}

function QueuePipelineDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 230 190"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* API node */}
				<circle cx="22" cy="95" r="12" />
				<path d="M17 95 h10 M22 90 v10" />
				{/* queue box */}
				<path d="M48 78 L92 76 L90 114 L46 116 Z" />
				<path d="M54 88 h32 M54 96 h32 M54 104 h22" />
				{/* fan-out */}
				<path d="M92 86 C 120 84, 124 60, 150 58 M92 95 L132 95 M92 106 C 120 108, 124 132, 150 132" />
				{/* workers */}
				<rect x="150" y="46" width="30" height="24" rx="2" />
				<rect x="150" y="83" width="30" height="24" rx="2" />
				<rect x="150" y="120" width="30" height="24" rx="2" />
				<path d="M156 58 l5 5 8 -9 M156 95 l5 5 8 -9 M156 132 l5 5 8 -9" />
				{/* fan-in to inbox */}
				<path d="M180 58 C 196 60, 194 84, 208 88 M180 95 L208 94 M180 132 C 196 130, 194 102, 208 98" />
				<path d="M196 76 L220 74 L218 114 L194 116 Z M196 76 L207 94 L218 74" />
				<path d="M62 150 c 8 -4, 16 3, 24 0 M90 152 c 8 -4, 16 3, 24 0 M118 154 c 8 -4, 16 3, 24 0" />
			</g>
		</svg>
	);
}

function WebhookLogDoodle({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 230 140"
			className={className}
			fill="none"
			aria-hidden="true"
		>
			<g className={sketch} stroke="currentColor">
				{/* terminal / log back */}
				<path d="M8 10 L88 6 L86 78 L6 82 Z M10 20 L84 16" />
				<path d="M14 30 l8 4 -8 4 M28 34 h18 M14 44 l8 4 -8 4 M28 48 h14 M14 58 l8 4 -8 4 M28 62 h18" />
				{/* email card front */}
				<path d="M84 48 L218 60 L212 130 L78 122 Z" />
				<path d="M84 48 L84 60 M218 60 L217 72 M88 58 L214 68" />
				<circle cx="98" cy="64" r="2" fill="currentColor" />
				<circle cx="108" cy="65" r="2" fill="currentColor" />
				{/* envelope + lines */}
				<path d="M96 78 L142 76 L140 110 L94 110 Z M96 78 L118 92 L142 76" />
				<path d="M150 82 L198 84 M150 92 L198 94 M150 102 L192 104" />
				{/* webhook bolt */}
				<path d="M62 92 l12 -2 -4 8 10 -2 -6 12 -2 -8 -10 2 Z" />
			</g>
		</svg>
	);
}

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
			sameAs: [socialProfiles.github, socialProfiles.discord, socialProfiles.x],
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			<div className="relative w-full bg-bg-white-0 text-text-sub-600 dark:bg-black dark:text-neutral-300">
				<div className="relative mx-auto w-full max-w-5xl overflow-x-clip border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
					{/* infra doodles — inside the framed gutters, non-interactive */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 text-neutral-400 dark:text-white/50"
					>
						<SmtpSendDoodle className="absolute top-28 right-6 hidden w-24 rotate-[8deg] opacity-60 md:block lg:right-10 lg:w-32 xl:right-14" />
						<ServerRackDoodle className="-rotate-[4deg] absolute top-[38%] left-6 hidden w-12 opacity-50 lg:left-10 lg:block lg:w-14 xl:left-14" />
						<QueuePipelineDoodle className="absolute top-[48%] right-4 hidden w-40 opacity-50 md:block lg:right-8 lg:w-52 xl:right-12 xl:w-60" />
						<WebhookLogDoodle className="absolute right-4 bottom-[14%] hidden w-40 rotate-[3deg] opacity-50 md:block lg:right-8 lg:w-52 xl:right-12 xl:w-60" />
					</div>

					<article className="relative mx-auto w-full max-w-[680px] px-6 pt-28 pb-24 sm:pt-36">
						<h1 className="font-semibold text-[40px] text-text-strong-950 leading-none tracking-tight sm:text-[44px] dark:text-white">
							why reloop?
						</h1>

						<div className="mt-10 space-y-7 text-[16.5px] leading-[1.75]">
							<p className="text-text-strong-950 dark:text-neutral-200">
								Self-hosting email has a scary reputation.
								<br />
								IP reputation. Warm-up schedules. Blocklists.
								<br />
								Everyone says the same thing: don&apos;t do it yourself.
							</p>

							<p className="pt-4 text-text-strong-950 dark:text-neutral-200">
								Proprietary grids treat deliverability like a secret.
								<br />
								Cold IP? Warm it for 6 weeks. Good luck.
								<br />
								Shared IP? Hope your neighbors behave.
								<br />
								Ask why you hit spam? That&apos;s proprietary.
							</p>

							<div className="space-y-1.5">
								<p>
									<span className="bg-primary-base box-decoration-clone px-1 py-0.5 text-white leading-[1.9]">
										But inbox placement doesn&apos;t come from secrets.
									</span>
								</p>
								<p>
									<span className="bg-primary-base box-decoration-clone px-1 py-0.5 text-white leading-[1.9]">
										It comes from a system that warms, watches, and backs off
										for you.
									</span>
								</p>
								<p className="pt-1 text-text-strong-950 dark:text-neutral-200">
									From asking{" "}
									<strong className="font-bold text-text-strong-950 dark:text-white">
										what if ?
									</strong>
								</p>
								<p className="text-text-strong-950 dark:text-neutral-200">
									What if warm-up was automatic? What if reputation was visible?
								</p>
							</div>

							{/* selected-frame card */}
							<div className="pt-4 pb-6">
								<div className="relative rotate-[1.2deg] border border-primary-base/90 bg-bg-white-0 p-6 sm:p-7 dark:bg-[#0a0a0a]">
									<span
										aria-hidden
										className="-top-1 -left-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-top-1 -right-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-bottom-1 -left-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-right-1 -bottom-1 absolute size-2 border border-primary-base bg-white"
									/>
									<p className="text-[16px] text-text-strong-950 leading-[1.75] dark:text-neutral-200">
										That&apos;s the Reloop Engine. Automated IP warmup with
										volume ramps. Smart retries with backoff. Suppression lists
										that actually suppress. DKIM rotation, SPF/DMARC alignment,
										blocklist and reputation monitoring — in the open. Same
										engine self-hosted or on reloop.sh. Nothing to babysit. The
										system does it.
									</p>
									<span className="-bottom-[26px] -translate-x-1/2 absolute left-1/2 rounded-[4px] bg-primary-base px-2 py-[3px] font-mono text-[11px] text-white leading-none">
										warmup × retries × reputation
									</span>
								</div>
							</div>

							<p className="text-text-strong-950 dark:text-neutral-200">
								We&apos;re not building another black-box grid.
								<br />
								We&apos;re building the email system we&apos;d bet a company on.
							</p>

							<p className="text-text-strong-950 dark:text-neutral-200">
								A place where warm-up isn&apos;t a spreadsheet —
								<br />
								it&apos;s the pipeline.
								<br />
								Where IP reputation isn&apos;t a score someone sells you —
								<br />
								it&apos;s signals you can see.
								<br />
								Where self-host doesn&apos;t mean alone.
							</p>

							<p className="text-text-strong-950 dark:text-neutral-200">
								So go ahead.
								<br />
								Skip the warm-up spreadsheet.
								<br />
								Send the first 3,000 free.
								<br />
								Read the code.
							</p>

							<div className="pt-6 text-[16px]">
								<p>
									<a
										href="https://github.com/pranavp10"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-neutral-500 dark:decoration-neutral-600 dark:hover:text-neutral-200"
									>
										Pranav
									</a>
									<span className="mx-2 text-text-sub-600 dark:text-neutral-500">
										&
									</span>
									<a
										href="https://github.com/twinkalp10"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-neutral-500 dark:decoration-neutral-600 dark:hover:text-neutral-200"
									>
										Twinkal
									</a>
								</p>
								<p className="mt-1 text-text-sub-600 dark:text-neutral-500">
									Co-Founders of Reloop
								</p>

								<div className="pt-8">
									<FancyButton.Root asChild variant="primary" size="medium">
										<a
											href={socialProfiles.github}
											target="_blank"
											rel="noopener noreferrer"
										>
											<FancyButton.Icon
												as={Icon}
												name="social-github"
												className="size-4"
											/>
											<span>View on GitHub</span>
										</a>
									</FancyButton.Root>
								</div>
							</div>
						</div>
					</article>
				</div>
			</div>
		</>
	);
};

export default AboutPage;
