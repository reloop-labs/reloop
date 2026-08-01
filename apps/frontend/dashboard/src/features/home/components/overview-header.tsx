import * as Button from "@reloop/ui/button";

const DOCS_URL = "https://reloop.sh/docs";

export function OverviewHeader({ userEmail }: { userEmail?: string | null }) {
	return (
		<div className="flex flex-col gap-4 pt-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					{userEmail ?? "Overview"}
				</h1>
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
			</div>
		</div>
	);
}
