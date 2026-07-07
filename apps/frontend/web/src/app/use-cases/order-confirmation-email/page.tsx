import { AutomationFlowLayout } from "@reloop/web/components/landing/use-cases/layouts";
import OrderConfirmationWidget from "@reloop/web/components/landing/use-cases/widgets/order-confirmation";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/order-confirmation-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function OrderConfirmationEmailPage() {
	return (
		<AutomationFlowLayout config={config}>
			<OrderConfirmationWidget />
		</AutomationFlowLayout>
	);
}
