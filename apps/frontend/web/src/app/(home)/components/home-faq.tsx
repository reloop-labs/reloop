import { FaqSection } from "@reloop/web/components/faq-section";
import { homeFaqItems } from "@reloop/web/lib/home-faq";

export function HomeFaq() {
	return (
		<div className="border-stroke-soft-100 border-y dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
			<FaqSection
				items={homeFaqItems}
				id="faq-section"
				eyebrow="FAQ"
				title="Frequently asked questions."
				compact
				plain
				flush
			/>
		</div>
	);
}
