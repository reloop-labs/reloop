import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouterState } from "@tanstack/react-router";

const DOCS_URL = "https://reloop.sh/docs/learn/emails";

export function EmailsListHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isReceived = pathname.includes("/emails/received");

	const title = isReceived ? "Email Received" : "Email Sent";
	const description = isReceived
		? "View and filter inbound emails received by your workspace mailboxes."
		: "Track and monitor your outbound transactional emails.";
	const iconName = isReceived ? "mail-receive" : "mail-send";

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name={iconName}
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{title}
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">{description}</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => window.open(DOCS_URL, "_blank")}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="video-guide" className="h-4 w-4 text-text-sub-600" />
					Video guide
				</Button.Root>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => window.open(DOCS_URL, "_blank")}
					className="rounded-xl"
				>
					Documentation
				</Button.Root>
			</div>
		</div>
	);
}
