import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { OpenSourceFaq } from "./components/open-source-faq";
import { OpenSourceSection } from "./components/open-source-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/why-open-source";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const pageTitle = "Why Open Source | Reloop";
const pageDescription =
	"Don't take our word for it. Reloop is open-source email infrastructure you can verify in code: no black-box claims page, single-click deploy, real product UI and DX.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"open source email infrastructure",
		"Apache 2.0 email platform",
		"self-hosted email server",
		"transparent email routing",
		"open source deliverability",
		"self-hostable email",
		"open source sendgrid alternative",
		"Reloop open source",
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

const WhyOpenSourcePage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		"@id": `${pageUrl}#article`,
		url: pageUrl,
		headline: pageTitle,
		description: pageDescription,
		publisher: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
		},
		isPartOf: {
			"@type": "WebSite",
			"@id": `${siteUrl}/#website`,
			name: "Reloop",
			url: siteUrl,
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-40 text-center sm:px-8 lg:px-12">
					<div
						aria-hidden="true"
						className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
					>
						<PixelBlast
							variant="square"
							pixelSize={2}
							color="#3B82F6"
							patternScale={4}
							patternDensity={0.45}
							enableRipples={false}
							rippleSpeed={0.05}
							rippleThickness={0.09}
							rippleIntensityScale={2.5}
							speed={0.2}
							transparent
							edgeFade={0.65}
						/>
					</div>
					<div className="relative z-10 flex w-auto max-w-full flex-col items-center px-8 py-6">
						<div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
							<span
								aria-hidden
								className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#003a8c]"
							>
								<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
									<Icon name="open-source" className="size-[11px]" />
								</span>
							</span>
							<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
								Open Source
							</span>
						</div>

						<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							Why{" "}
							<span className="bg-gradient-to-b from-[#2f86ff] to-primary-base bg-clip-text text-transparent dark:from-[#7ab8ff] dark:to-[#4ea1ff]">
								open source.
							</span>
						</h1>

						<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
							Closed email tools sell trust. We sell a repo you can open.
						</p>
					</div>
				</header>

				<OpenSourceSection />

				<OpenSourceFaq />
			</div>
		</>
	);
};

export default WhyOpenSourcePage;
