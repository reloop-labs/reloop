import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useHotkeys } from "react-hotkeys-hook";
import { WebhooksApiDetails } from "#/components/api-details/webhooks";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/webhooks";

export function WebhooksListHeader() {
	const router = useRouter();

	const openCreate = () => {
		router.push("/webhooks/create");
	};

	const openDocs = () => {
		window.open(DOCS_URL, "_blank");
	};

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			openCreate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	// S is handled by WebhooksApiDetails trigger (opens SDK samples).

	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 pb-4 sm:flex-nowrap sm:items-start">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="webhook"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Webhooks
					</h1>
				</div>
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-2">
				<WebhooksApiDetails
					renderTrigger={({ open }: { open: () => void }) => (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={open}
							className="gap-1.5 rounded-xl max-sm:hidden"
							aria-keyshortcuts="s"
						>
							SDK samples
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
					className="gap-1.5 rounded-xl max-sm:hidden"
					aria-keyshortcuts="d"
				>
					Documentation
					<ActionKbd className="w-auto min-w-4 px-1">D</ActionKbd>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="neutral"
					size="small"
					onClick={openCreate}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create webhook
					<ActionKbd
						className={cn(actionKbdOnSolidClassName, "w-auto min-w-4 px-1")}
					>
						C
					</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
