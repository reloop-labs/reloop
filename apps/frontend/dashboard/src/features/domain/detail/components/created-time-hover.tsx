import { Icon } from "@reloop/ui/icon";
import { Fragment, type ReactNode } from "react";
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

function TimePopoverContent({
	date,
	idPrefix,
}: {
	date: Date;
	idPrefix: string;
}) {
	const { copiedItems, copyToClipboard } = useClipboard();

	const rows = [
		{ id: "local", label: "Local", value: formatLocal(date) },
		{ id: "utc", label: "UTC", value: date.toISOString() },
	];

	return (
		<div className="flex flex-col">
			{rows.map((row, index) => {
				const copied = copiedItems.has(`${idPrefix}-${row.id}`);
				return (
					<Fragment key={row.id}>
						{index > 0 && (
							<div className="h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
						)}
						<div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
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
									copyToClipboard(row.value, `${idPrefix}-${row.id}`)
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
	);
}

function parseDate(value?: string | null) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function CreatedTime({ createdAt }: { createdAt?: string | null }) {
	const date = parseDate(createdAt);

	if (!date) {
		return (
			<span className="font-medium text-paragraph-sm text-text-strong-950">
				---
			</span>
		);
	}

	return (
		<HoverPopover
			side="top"
			align="center"
			sideOffset={8}
			showArrow={false}
			trigger={
				<span className="cursor-default font-medium text-paragraph-sm text-text-strong-950 underline decoration-stroke-soft-200 decoration-dotted underline-offset-4 transition-colors hover:decoration-primary-base">
					{formatRelativeTime(createdAt as string)}
				</span>
			}
			contentClassName="w-80 rounded-xl p-2 shadow-none!"
		>
			<TimePopoverContent date={date} idPrefix="created" />
		</HoverPopover>
	);
}

/** Hover time tooltip for timeline steps — opens below the trigger. */
export function TimeHover({
	value,
	trigger,
	idPrefix,
}: {
	value?: string | null;
	trigger: ReactNode;
	idPrefix: string;
}) {
	const date = parseDate(value);

	if (!date) return <>{trigger}</>;

	return (
		<HoverPopover
			side="bottom"
			align="center"
			sideOffset={8}
			showArrow={false}
			trigger={trigger}
			contentClassName="w-80 rounded-xl p-2 shadow-none!"
		>
			<TimePopoverContent date={date} idPrefix={idPrefix} />
		</HoverPopover>
	);
}
