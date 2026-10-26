import { JsonLd } from "@reloop/web/components/json-ld";
import {
	buildCompareJsonLd,
	getComparePage,
} from "@reloop/web/lib/compare-content";
import { pricingProductJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";

export function ComparePageJsonLd({
	slug,
	withFaq = true,
}: {
	slug: string;
	/** Set false when the page doesn't render its FAQ. */
	withFaq?: boolean;
}) {
	const page = getComparePage(slug);
	if (!page) return null;
	return <JsonLd data={buildCompareJsonLd(page, { withFaq })} />;
}

export function CompareIndexJsonLd() {
	const siteUrl = getSiteUrl();
	return (
		<JsonLd
			data={[
				{
					"@context": "https://schema.org",
					"@type": "CollectionPage",
					name: "Reloop vs the competition",
					description:
						"Compare Reloop with Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, Mailchimp, Brevo, Mailjet, SparkPost and other email providers.",
					url: `${siteUrl}/compare`,
				},
				pricingProductJsonLd(siteUrl),
			]}
		/>
	);
}
