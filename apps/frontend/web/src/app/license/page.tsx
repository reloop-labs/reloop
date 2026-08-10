import { JsonLd } from "@reloop/web/components/json-ld";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { LicenseDocument } from "./components/license-document";

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
			<div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-24 sm:pt-16 md:max-w-7xl dark:border-white/10">
				{/* 3-column layout with solid straight dividers */}
				<div className="grid flex-1 grid-cols-1 lg:grid-cols-12">
					{/* Left label */}
					<div className="flex justify-start border-stroke-soft-200 border-b px-6 py-8 text-left sm:px-8 lg:col-span-2 lg:justify-end lg:border-r lg:border-b-0 lg:px-6 lg:py-16 lg:text-right dark:border-white/10">
						<div className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							License
						</div>
					</div>

					{/* Center layered card — wider */}
					<div className="flex flex-col border-stroke-soft-200 border-b px-5 py-8 sm:px-8 sm:py-10 lg:col-span-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-14 xl:px-10 dark:border-white/10">
						<LicenseDocument />
					</div>

					{/* Right meta */}
					<div className="flex justify-start px-6 py-8 sm:px-8 lg:col-span-2 lg:px-6 lg:py-16 dark:border-white/10">
						<div className="w-full space-y-2.5">
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
								Apache License 2.0
							</p>
							<p className="text-[13.5px] text-text-sub-600 leading-normal dark:text-white/55">
								Personal &amp; internal use allowed. No commercial
								redistribution or competing hosted services.
							</p>
							<a
								href={`mailto:${contactEmail}`}
								className="inline-block font-medium text-[13.5px] text-text-sub-600 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:text-text-strong-950 hover:decoration-text-strong-950 dark:text-white/50 dark:hover:text-white"
							>
								{contactEmail}
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default LicensePage;
