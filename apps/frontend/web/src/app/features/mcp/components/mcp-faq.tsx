import { FaqSection } from "@reloop/web/components/faq-section";
import { mcpFaq } from "@reloop/web/lib/landing/ai-tools/mcp";

export function McpFaq() {
	return <FaqSection items={mcpFaq} id="mcp-faq" compact plain />;
}
