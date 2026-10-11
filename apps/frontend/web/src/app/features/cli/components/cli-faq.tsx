import { FaqSection } from "@reloop/web/components/faq-section";
import { cliFaq } from "@reloop/web/lib/landing/ai-tools/cli";

export function CliFaq() {
	return <FaqSection items={cliFaq} id="cli-faq" compact plain />;
}
