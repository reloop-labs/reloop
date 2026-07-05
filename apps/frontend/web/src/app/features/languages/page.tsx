import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import IndexCta from "./components/index-cta";
import IndexHero from "./components/index-hero";
import LanguagesGrid from "./components/languages-grid";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/features/languages`;

export const metadata: Metadata = {
	title: "Send Email in Your Language | Reloop",
	description:
		"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET. Send transactional and marketing email with type-safe clients.",
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
		title: "Send Email in Your Language | Reloop",
		description:
			"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Send Email in Your Language | Reloop",
		description:
			"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
	},
};

export default function LanguagesIndexPage() {
	return (
		<div>
			<IndexHero />
			<LanguagesGrid />
			<IndexCta />
		</div>
	);
}
