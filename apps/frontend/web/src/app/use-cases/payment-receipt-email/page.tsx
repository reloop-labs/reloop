import { CenteredVisualLayout } from "@reloop/web/components/landing/use-cases/layouts";
import PaymentReceiptWidget from "@reloop/web/components/landing/use-cases/widgets/payment-receipt";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/payment-receipt-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function PaymentReceiptEmailPage() {
	return (
		<CenteredVisualLayout config={config}>
			<PaymentReceiptWidget />
		</CenteredVisualLayout>
	);
}
