import type { Metadata } from "next";
import IndexCta from "./components/index-cta";
import IndexHero from "./components/index-hero";
import LanguagesGrid from "./components/languages-grid";

export const metadata: Metadata = {
	title: "Send Email in Your Language | Reloop",
	description:
		"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET. Send transactional and marketing email with type-safe clients.",
	openGraph: {
		title: "Send Email in Your Language | Reloop",
		description:
			"Official Reloop SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
		type: "website",
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
