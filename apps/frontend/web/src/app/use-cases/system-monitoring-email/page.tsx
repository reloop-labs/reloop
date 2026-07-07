import { ConsoleFirstLayout } from "@reloop/web/components/landing/use-cases/layouts";
import SystemMonitoringWidget from "@reloop/web/components/landing/use-cases/widgets/system-monitoring";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/system-monitoring-email";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function SystemMonitoringEmailPage() {
	return (
		<ConsoleFirstLayout config={config}>
			<SystemMonitoringWidget />
		</ConsoleFirstLayout>
	);
}
