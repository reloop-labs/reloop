import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const DOCS_URL = "https://reloop.sh/docs/learn/metrics";

export function MetricsListHeader() {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 pb-4 sm:flex-nowrap sm:items-start">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="fat-row"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Metrics
					</h1>
				</div>
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => window.open(DOCS_URL, "_blank")}
					className="rounded-xl max-sm:hidden"
				>
					Documentation
				</Button.Root>
			</div>
		</div>
	);
}
