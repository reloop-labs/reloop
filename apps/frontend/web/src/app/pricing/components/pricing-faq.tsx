import { FaqSection } from "@reloop/web/components/faq-section";
import { pricingFaqItems } from "@reloop/web/lib/pricing-faq";

export function PricingFaq() {
	return <FaqSection items={pricingFaqItems} id="pricing-faq" compact />;
}
