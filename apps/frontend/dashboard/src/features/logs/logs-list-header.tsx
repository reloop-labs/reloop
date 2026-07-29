import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const DOCS_URL = "https://reloop.sh/docs/learn/logs";

export function LogsListHeader() {
	return (
		<div className="flex flex-col gap-4 pt-2 pb-0 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="logs"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Logs
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Inspect API requests and delivery events for your workspace.
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
			</div>
		</div>
	);
}
