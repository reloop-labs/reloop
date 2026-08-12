import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import type { LanguageDefinition } from "../languages";

export default function LanguageCta({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<BlogCta
			headline={`Start sending with ${language.name} today.`}
			sub={`Get your API key, verify a domain, and build reliable email infrastructure with the official ${language.name} SDK.`}
			primaryLabel="Get API Key"
			primaryHref="/dashboard/signup"
			secondaryLabel={`${language.name} Docs`}
			secondaryHref={language.docsPath}
			accentColor="blue"
		/>
	);
}
