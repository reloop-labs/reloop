import { Icon } from "@reloop/ui/icon";
import { Fragment } from "react";
import { HoverPopover } from "#/features/agent-inbox/components/thread-detail/hover-popover";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { useClipboard } from "../hooks/use-clipboard";

function formatLocal(date: Date) {
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		timeZoneName: "short",
	});
}

export function CreatedTime({ createdAt }: { createdAt?: string | null }) {
	const { copiedItems, copyToClipboard } = useClipboard();

	if (!createdAt) {
		return (
			<span className="font-medium text-paragraph-sm text-text-strong-950">
				---
			</span>
		);
	}

	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) {
		return (
			<span className="font-medium text-paragraph-sm text-text-strong-950">
				---
			</span>
		);
	}

	const rows = [
		{ id: "local", label: "Local", value: formatLocal(date) },
		{ id: "utc", label: "UTC", value: date.toISOString() },
	];

	return (
		<HoverPopover
			side="top"
			align="center"
			sideOffset={8}
			showArrow={false}
			trigger={
				<span className="cursor-default font-medium text-paragraph-sm text-text-strong-950 underline decoration-stroke-soft-200 decoration-dotted underline-offset-4 transition-colors hover:decoration-primary-base">
					{formatRelativeTime(createdAt)}
				</span>
			}
			contentClassName="w-80 rounded-xl p-2 shadow-none"
		>
			<div className="flex flex-col">
				{rows.map((row, index) => {
					const copied = copiedItems.has(`created-${row.id}`);
					return (
						<Fragment key={row.id}>
							{index > 0 && (
								<div className="h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
							)}
							<div
								key={row.id}
								className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
							>
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
										{row.label}
									</span>
									<span className="break-all font-mono text-text-strong-950 text-xs">
										{row.value}
									</span>
								</div>
								<button
									type="button"
									onClick={() =>
										copyToClipboard(row.value, `created-${row.id}`)
									}
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40"
									title={`Copy ${row.label} time`}
								>
									{copied ? (
										<Icon
											name="check"
											className="h-3.5 w-3.5 text-success-base"
										/>
									) : (
										<Icon name="copy" className="h-3.5 w-3.5" />
									)}
								</button>
							</div>
						</Fragment>
					);
				})}
			</div>
		</HoverPopover>
	);
}
