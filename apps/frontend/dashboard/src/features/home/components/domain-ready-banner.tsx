import Link from "next/link";
import * as Alert from "@reloop/ui/alert";
import { Icon } from "@reloop/ui/icon";
import { SendFirstEmailButton } from "./send-first-email-button";

export type ReadyDomain = {
	id: string;
	domain: string;
};

/**
 * Positive status strip: names the verified domain(s) and offers one-click send.
 * Shown only when at least one domain is active.
 */
export function DomainReadyBanner({
	domains,
	hasSentEmail,
}: {
	domains: ReadyDomain[];
	/** Hide the send CTA once they've already sent (banner still confirms readiness). */
	hasSentEmail?: boolean;
}) {
	if (domains.length === 0) return null;

	const primary = domains[0]!;
	const extras = domains.length - 1;

	const title =
		extras > 0
			? `${primary.domain} (+${extras} more) are ready to send`
			: `${primary.domain} is ready to send`;

	const description =
		extras > 0
			? `These domains are verified and authenticated. Test emails send from hello@${primary.domain}.`
			: `Your domain is verified. We’ll send a test email from hello@${primary.domain} to your account.`;

	return (
		<Alert.Root
			variant="lighter"
			status="success"
			size="large"
			className="rounded-2xl ring-1 ring-inset ring-stroke-soft-200"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-medium text-label-md text-text-strong-950">
							{title}
						</span>
						<span className="inline-flex items-center gap-1 rounded-full bg-success-lighter px-2 py-0.5 font-medium text-label-xs text-success-base">
							<span className="h-1.5 w-1.5 rounded-full bg-success-base" />
							Ready
						</span>
					</div>
					<p className="text-paragraph-sm text-text-sub-600">{description}</p>
					{domains.length > 1 ? (
						<ul className="mt-1.5 flex flex-wrap gap-1.5">
							{domains.map((d) => (
								<li key={d.id}>
									<Link
										href={`/domain/${d.id}`}
										className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-100 bg-bg-white-0 px-2 py-0.5 font-medium text-label-xs text-text-sub-600 transition-colors hover:border-stroke-soft-200 hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]"
									>
										<Icon name="globe" className="h-3 w-3" />
										{d.domain}
									</Link>
								</li>
							))}
						</ul>
					) : (
						<Link
							href={`/domain/${primary.id}`}
							className="inline-flex items-center gap-1 font-medium text-paragraph-xs text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							<Icon name="globe" className="h-3 w-3" />
							{primary.domain}
							<span className="text-text-soft-400">· View domain</span>
						</Link>
					)}
				</div>

				{!hasSentEmail ? (
					<div className="shrink-0">
						<SendFirstEmailButton label="Send test email" />
					</div>
				) : null}
			</div>
		</Alert.Root>
	);
}
