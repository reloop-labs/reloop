import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import IndexHero from "./components/index-hero";
import LanguageExplorer from "./components/language-explorer";
import LanguagesGrid from "./components/languages-grid";
import { languages } from "./languages";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/languages`;

export const metadata: Metadata = {
	title: "Official SDKs | Node.js, Python, Go, Rust & more",
	description:
		"Official Reloop email SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET. Install the package, send email, ship.",
	keywords: [
		"email SDK",
		"Node.js email",
		"Python email API",
		"Go email library",
		"Rust email SDK",
		"PHP email client",
		"Ruby email gem",
		"Java email SDK",
		".NET email library",
		"Reloop SDK",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Official SDKs | Reloop",
		description:
			"Official Reloop email SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Official SDKs | Reloop",
		description:
			"Official Reloop email SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
	},
};

const languagesSchema = {
	"@context": "https://schema.org" as const,
	"@type": "ItemList" as const,
	name: "Reloop Official SDKs",
	description:
		"Official Reloop email SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
	url: pageUrl,
	numberOfItems: languages.length,
	itemListElement: languages.map((lang, index) => ({
		"@type": "ListItem" as const,
		position: index + 1,
		url: `${siteUrl}/languages/${lang.slug}`,
		name: `${lang.name} email SDK`,
		description: lang.shortDescription,
	})),
};

export default function LanguagesIndexPage() {
	return (
		<>
			<JsonLd data={languagesSchema} />
			<main className="w-full bg-bg-white-0 dark:bg-black">
				<IndexHero />
				<LanguageExplorer />
				<LanguagesGrid />
				<BlogCta
					headline="One API key. Every runtime."
					sub="Create an account, verify a domain, and send from any official SDK—or plain SMTP."
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
