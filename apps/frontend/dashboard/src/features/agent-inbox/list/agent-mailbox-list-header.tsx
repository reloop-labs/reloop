import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";

const DOCS_URL = "https://reloop.sh/docs/learn/agent-inbox";

export function AgentMailboxListHeader() {
	const [, setModal] = useQueryState("modal");

	const openAdd = () => {
		void setModal("create-agent-mailbox");
	};

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		openAdd();
	});

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="inbox"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Inbox
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Create dedicated addresses and open conversations.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
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
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openAdd}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Add address
				</FancyButton.Root>
			</div>
		</div>
	);
}
