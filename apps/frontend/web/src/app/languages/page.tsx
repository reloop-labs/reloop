import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import IndexCta from "./components/index-cta";
import IndexHero from "./components/index-hero";
import LanguageExplorer from "./components/language-explorer";
import LanguagesGrid from "./components/languages-grid";
import LanguagesMatrix from "./components/languages-matrix";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/languages`;

export const metadata: Metadata = {
	title: "Official Reloop SDKs & Runtimes | Node.js, Python, Go, Rust",
	description:
		"Send transactional and marketing email using official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET. 100% type-safe with zero-cost abstractions.",
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
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Official Reloop SDKs & Runtimes | Reloop",
		description:
			"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Official Reloop SDKs & Runtimes | Reloop",
		description:
			"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
	},
};

export default function LanguagesIndexPage() {
	return (
		<main className="w-full bg-bg-white-0 dark:bg-bg-black-950">
			<IndexHero />
			<LanguageExplorer />
			<LanguagesMatrix />
			<LanguagesGrid />
			<IndexCta />
		</main>
	);
}
