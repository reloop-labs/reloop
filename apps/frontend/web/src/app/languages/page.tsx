import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import FrameworksGrid from "./components/frameworks-grid";
import IndexHero from "./components/index-hero";
import LanguageExplorer from "./components/language-explorer";
import LanguagesGrid from "./components/languages-grid";
import { frameworks } from "./frameworks";
import { languages } from "./languages";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/languages`;

export const metadata: Metadata = {
	title: "SDKs & Framework Integrations | Next.js, Django, Laravel & more",
	description:
		"Official Reloop email SDKs and framework guides for Next.js, Express, Django, FastAPI, Laravel, Rails, Spring Boot, ASP.NET, and more.",
	keywords: [
		"email SDK",
		"Next.js email",
		"Django email",
		"Laravel email",
		"FastAPI email",
		"Express email",
		"Rails email",
		"Spring Boot email",
		"NestJS email",
		"Node.js email",
		"Python email API",
		"Reloop SDK",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "SDKs & Framework Integrations | Reloop",
		description:
			"Official Reloop email SDKs and framework guides for Next.js, Django, Laravel, Rails, and more.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "SDKs & Framework Integrations | Reloop",
		description:
			"Official Reloop email SDKs and framework guides for Next.js, Django, Laravel, Rails, and more.",
	},
};

const pageSchema = {
	"@context": "https://schema.org" as const,
	"@graph": [
		{
			"@type": "ItemList" as const,
			name: "Reloop Framework Integrations",
			description:
				"Send transactional email from popular frameworks with Reloop.",
			url: `${pageUrl}#frameworks`,
			numberOfItems: frameworks.length,
			itemListElement: frameworks.map((fw, index) => ({
				"@type": "ListItem" as const,
				position: index + 1,
				url: `${siteUrl}/frameworks/${fw.slug}`,
				name: `${fw.name} email`,
				description: fw.shortDescription,
			})),
		},
		{
			"@type": "ItemList" as const,
			name: "Reloop Official SDKs",
			description:
				"Official Reloop email SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
			url: `${pageUrl}#sdk-guides`,
			numberOfItems: languages.length,
			itemListElement: languages.map((lang, index) => ({
				"@type": "ListItem" as const,
				position: index + 1,
				url: `${siteUrl}/languages/${lang.slug}`,
				name: `${lang.name} email SDK`,
				description: lang.shortDescription,
			})),
		},
	],
};

export default function LanguagesIndexPage() {
	return (
		<>
			<JsonLd data={pageSchema} />
			<main className="w-full bg-bg-white-0 dark:bg-black">
				<IndexHero />
				{/* Frameworks first — how most people search */}
				<FrameworksGrid />
				<LanguageExplorer />
				<LanguagesGrid />
				<BlogCta
					headline="One API key. Every stack."
					sub="Create an account, verify a domain, and send from any framework or official SDK."
					primaryLabel="Get started free"
					primaryHref="/dashboard/signup"
					secondaryLabel="Quickstart"
					secondaryHref="/docs/quickstart"
					accentColor="blue"
				/>
			</main>
		</>
	);
}
