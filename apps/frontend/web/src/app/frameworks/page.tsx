import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import FrameworksGrid from "../languages/components/frameworks-grid";
import LanguagesGrid from "../languages/components/languages-grid";
import { frameworks } from "../languages/frameworks";
import { languages } from "../languages/languages";
import FrameworksIndexHero from "./components/frameworks-index-hero";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/frameworks`;

export const metadata: Metadata = {
	title: "Framework Integrations | Next.js, Django, Laravel & more | Reloop",
	description:
		"Official email framework guides for Next.js, Express, NestJS, Fastify, Elysia, Django, FastAPI, Flask, Laravel, Rails, Spring Boot, ASP.NET Core, Phoenix, and Gin.",
	keywords: [
		"email frameworks",
		"Next.js email",
		"Express email",
		"NestJS email",
		"Fastify email",
		"Elysia email",
		"Django email",
		"FastAPI email",
		"Flask email",
		"Laravel email",
		"Rails email",
		"Spring Boot email",
		"ASP.NET email",
		"Phoenix email",
		"Gin email",
		"Reloop integrations",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Framework Integrations | Reloop",
		description:
			"Official email guides for Next.js, Express, Django, FastAPI, Laravel, Rails, Spring Boot, and more.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Framework Integrations | Reloop",
		description:
			"Official email guides for Next.js, Express, Django, FastAPI, Laravel, Rails, Spring Boot, and more.",
	},
};

const pageSchema = {
	"@context": "https://schema.org" as const,
	"@graph": [
		{
			"@type": "ItemList" as const,
			name: "Reloop Framework Integrations",
			description:
				"Step-by-step guides for sending transactional email from web frameworks.",
			url: `${pageUrl}#frameworks`,
			numberOfItems: frameworks.length,
			itemListElement: frameworks.map((fw, index) => ({
				"@type": "ListItem" as const,
				position: index + 1,
				url: `${siteUrl}/frameworks/${fw.slug}`,
				name: `${fw.name} email integration`,
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

export default function FrameworksIndexPage() {
	return (
		<>
			<JsonLd data={pageSchema} />
			<main className="w-full max-w-full overflow-x-clip bg-bg-white-0 dark:bg-black">
				<FrameworksIndexHero />
				<FrameworksGrid />
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
