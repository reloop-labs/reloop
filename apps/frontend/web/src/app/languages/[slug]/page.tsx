import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageCode from "../components/language-code";
import LanguageCta from "../components/language-cta";
import LanguageFrameworks from "../components/language-frameworks";
import LanguageHero from "../components/language-hero";
import LanguageMore from "../components/language-more";
import { getLanguage, isLanguageSlug, LANGUAGE_SLUGS } from "../languages";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return LANGUAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const language = getLanguage(slug);
	if (!language) {
		return { title: "Language | Reloop" };
	}
	const title = `Integrate with Reloop using ${language.name} | Reloop`;
	const description = `Official ${language.name} SDK for Reloop. Install ${language.packageName} and send email with a few lines of code.`;
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
		},
	};
}

export default async function LanguagePage({ params }: PageProps) {
	const { slug } = await params;
	if (!isLanguageSlug(slug)) {
		notFound();
	}
	const language = getLanguage(slug);
	if (!language) {
		notFound();
	}

	return (
		<main className="w-full bg-bg-white-0 dark:bg-black">
			<LanguageHero language={language} />
			<LanguageCode language={language} />
			<LanguageFrameworks language={language} />
			<LanguageMore current={language} />
			<LanguageCta language={language} />
		</main>
	);
}
