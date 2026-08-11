import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { EmailsApiDetails } from "#/components/api-details/emails";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/learn/emails";

export function EmailsListHeader() {
	const pathname = usePathname();
	const isReceived =
		pathname === "/receive" || pathname.startsWith("/receive/");

	const title = isReceived ? "Email Received" : "Email Sent";
	const description = isReceived
		? "View and filter inbound emails received by your workspace mailboxes."
		: "Track and monitor your outbound transactional emails.";
	const iconName = isReceived ? "mail-receive" : "mail-send";

	const openDocs = () => window.open(DOCS_URL, "_blank");

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

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
				<EmailsApiDetails
					isReceived={isReceived}
					renderTrigger={({ open }: { open: () => void }) => (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={open}
							className="gap-1.5 rounded-xl"
							aria-keyshortcuts="s"
						>
							<Icon name="code" className="h-4 w-4 text-text-sub-600" />
							SDK
							<ActionKbd className="w-auto min-w-4 px-1">S</ActionKbd>
						</Button.Root>
					)}
				/>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={openDocs}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="d"
				>
					Documentation
					<ActionKbd className="w-auto min-w-4 px-1">D</ActionKbd>
				</Button.Root>
			</div>
		</div>
	);
}

