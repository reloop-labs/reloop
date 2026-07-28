import Link from "next/link";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { SendFirstEmailButton } from "./send-first-email-button";

const DOCS_URL = "https://reloop.sh/docs";

export function OverviewHeader({
	userEmail,
	organizationName,
	canSendFirstEmail,
	readyDomainName,
}: {
	userEmail?: string | null;
	organizationName?: string | null;
	/** True when the workspace has at least one active domain. */
	canSendFirstEmail?: boolean;
	/** Hostname of the first active domain, shown in the subtitle. */
	readyDomainName?: string | null;
}) {
	const subtitle = readyDomainName
		? `${readyDomainName} is verified and ready to send${
				organizationName ? ` · ${organizationName}` : ""
			}`
		: organizationName
			? `Workspace health and recent activity for ${organizationName}.`
			: "Workspace health and recent activity.";

	return (
		<div className="flex flex-col gap-4 pt-2 pb-2 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					{userEmail ?? "Overview"}
				</h1>
				<p className="mt-1 text-sm text-text-sub-600">{subtitle}</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					asChild
					className="rounded-xl"
				>
					<a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
						Documentation
					</a>
				</Button.Root>
				{canSendFirstEmail ? (
					<SendFirstEmailButton />
				) : (
					<FancyButton.Root
						variant="blue"
						size="small"
						asChild
						className="gap-1.5 rounded-xl"
					>
						<Link href="/api-keys">
							<Icon name="key-new" className="h-4 w-4" />
							API keys
						</Link>
					</FancyButton.Root>
				)}
			</div>
		</div>
	);
}
