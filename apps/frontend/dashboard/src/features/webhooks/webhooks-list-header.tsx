import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useHotkeys } from "react-hotkeys-hook";

const DOCS_URL = "https://reloop.sh/docs/learn/webhook";

export function WebhooksListHeader() {
	const router = useRouter();

	const openCreate = () => {
		router.push("/webhooks/create");
	};

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		openCreate();
	});

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
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
				<p className="mt-1 text-sm text-text-sub-600">
					Manage endpoints, delivery logs, and signed event payloads.
				</p>
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
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openCreate}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create webhook
				</FancyButton.Root>
			</div>
		</div>
	);
}
