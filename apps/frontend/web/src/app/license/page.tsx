import { JsonLd } from "@reloop/web/components/json-ld";
import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { LicenseFaq } from "./components/license-faq";
import { LicenseSection } from "./components/license-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/license`;

export const metadata: Metadata = {
	title: "License | Reloop",
	description:
		"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs. Review permitted uses, hosted service, and self-hosting options.",
	keywords: [
		"Reloop license",
		"Apache 2.0 license",
		"open source email license",
		"email platform license",
		"self-hosting license",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions.",
	},
};

const LicensePage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${pageUrl}#webpage`,
		url: pageUrl,
		name: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs.",
		isPartOf: {
			"@type": "WebSite",
			"@id": `${siteUrl}/#website`,
			name: "Reloop",
			url: siteUrl,
		},
		about: {
			"@type": "CreativeWork",
			name: "Reloop License",
			license: "https://www.apache.org/licenses/LICENSE-2.0",
			copyrightHolder: {
				"@type": "Organization",
				name: "Reloop Labs",
				email: contactEmail,
			},
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x [--primary-base:#047857] [--primary-dark:#047857] [--primary-darker:#065f46] [--primary-link:#047857] md:max-w-7xl dark:border-white/10 dark:[--primary-base:#6ee7b7] dark:[--primary-dark:#6ee7b7] dark:[--primary-darker:#a7f3d0] dark:[--primary-link:#6ee7b7]">
				<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-40 text-center sm:px-8 lg:px-12">
					<div
						aria-hidden="true"
						className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
					>
						<PixelBlast
							variant="square"
							pixelSize={2}
							color="#34d399"
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
								<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 18 18"
										width="11"
										height="11"
										fill="none"
										aria-hidden
									>
										<path
											d="M14.5 14.5C13.678 14.5 12.956 14.098 12.5 13.486V17.5C12.5 17.702 12.622 17.885 12.809 17.962C12.996 18.041 13.21 17.997 13.354 17.854L14.5 16.708L15.646 17.854C15.742 17.95 15.87 18 16 18C16.064 18 16.13 17.988 16.191 17.962C16.378 17.885 16.5 17.702 16.5 17.5V13.486C16.044 14.098 15.322 14.5 14.5 14.5Z"
											fill="currentColor"
										/>
										<path
											d="M10.25 16.25H4.25C3.145 16.25 2.25 15.355 2.25 14.25V3.75C2.25 2.645 3.145 1.75 4.25 1.75H12.75C13.855 1.75 14.75 2.645 14.75 3.75V6.5"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M5.25 5.75H11.75"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M5.25 9H8.25"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M5.25 12.25H8.25"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M14.5 14.5C15.881 14.5 17 13.3807 17 12C17 10.6193 15.881 9.5 14.5 9.5C13.119 9.5 12 10.6193 12 12C12 13.3807 13.119 14.5 14.5 14.5Z"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							</span>
							<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
								Open Source
							</span>
						</div>

						<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
								License
							</span>{" "}
							Agreement.
						</h1>

						<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
							Built on Apache 2.0 with a few common-sense limits. Free for
							personal and internal use.
						</p>
					</div>
				</header>

				<LicenseSection />

				<LicenseFaq />
			</div>
		</>
	);
};

export default LicensePage;
