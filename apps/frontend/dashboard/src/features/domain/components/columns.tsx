import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import * as Switch from "@reloop/ui/switch";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	type DomainFeatureId,
	useDomainFeatureToggle,
} from "../hooks/use-domain-feature-toggle";
import type { Domain } from "../types";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
	getStatusPillClass,
} from "../utils";
import { DomainFavicon } from "./domain-favicon";
import { groupLabelOf, rootDomainOf } from "./domain-groups";

export type DomainTableMeta = {
	/** Ids of root domains heading a group of subdomains, labelled by name only. */
	groupParentIds?: ReadonlySet<string>;
};

/** Domain status pill; `null` for a group whose domains differ ("Mixed"). */
export function DomainStatusCell({
	status,
}: {
	status: Domain["status"] | null;
}) {
	return (
		<div className="flex items-center">
			<span
				className={cn(
					"inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-md border px-1 font-medium text-xs leading-none",
					getStatusPillClass(status),
				)}
			>
				<Icon
					name={status ? getStatusIcon(status) : "minus-circle"}
					className="h-3 w-3 shrink-0"
				/>
				{status ? getStatusLabel(status) : "Mixed"}
			</span>
		</div>
	);
}

export type FeatureState = "on" | "off" | "mixed";

const CONFIRM_COPY: Record<
	DomainFeatureId,
	{ noun: string; on: string; off: string }
> = {
	sending: {
		noun: "sending",
		on: "will be able to send email.",
		off: "will stop sending email.",
	},
	receiving: {
		noun: "receiving",
		on: "will start receiving email.",
		off: "will stop receiving email.",
	},
	clickTracking: {
		noun: "click tracking",
		on: "will track link clicks.",
		off: "will stop tracking link clicks.",
	},
	openTracking: {
		noun: "open tracking",
		on: "will track email opens.",
		off: "will stop tracking email opens.",
	},
};

/**
 * Switch that turns a feature on/off for one domain (or every domain in a
 * group). A small popover on the switch asks to confirm before anything changes.
 */
export function FeatureSwitch({
	domainIds,
	domainName,
	feature,
	state,
	label,
}: {
	domainIds: string[];
	/** Shown in the confirmation, e.g. "mc.reloop.sh". */
	domainName: string;
	feature: DomainFeatureId;
	state: FeatureState;
	label: string;
}) {
	const toggle = useDomainFeatureToggle();
	const [pending, setPending] = useState<boolean | null>(null);
	const copy = CONFIRM_COPY[feature];
	const next = pending ?? state !== "on";

	return (
		<div
			className="flex items-center"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Popover.Root
				open={pending !== null}
				onOpenChange={(open) => {
					if (!open) setPending(null);
				}}
			>
				<Popover.Anchor asChild>
					<span className="inline-flex">
						<Switch.Root
							checked={state === "on"}
							onCheckedChange={(checked) => setPending(checked)}
							aria-label={label}
							title={
								state === "mixed"
									? "On for some domains in this group"
									: undefined
							}
						/>
					</span>
				</Popover.Anchor>
				<Popover.Content
					side="bottom"
					align="center"
					sideOffset={0}
					unstyled
					className="w-64 rounded-2xl bg-bg-white-0 p-3 ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-weak-50 dark:ring-stroke-soft-100/40"
				>
					<p className="font-medium text-label-sm text-text-strong-950 dark:text-white">
						Turn {next ? "on" : "off"} {copy.noun}?
					</p>
					<p className="mt-1 text-paragraph-xs text-text-sub-600">
						{domainName} {next ? copy.on : copy.off}
					</p>
					<div className="mt-3 flex justify-end gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => setPending(null)}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={() => {
								setPending(null);
								void toggle(domainIds, feature, next);
							}}
						>
							Turn {next ? "on" : "off"}
						</FancyButton.Root>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	);
}

/** Per-domain features shown as switch columns, in column order. */
export const DOMAIN_FEATURES = [
	{
		id: "sending",
		label: "Sending",
		icon: "mail-send",
		pick: (d: Domain) => d.isSendingEmailEnabled,
	},
	{
		id: "receiving",
		label: "Receiving",
		icon: "mail-receive",
		pick: (d: Domain) => d.isReceivingEmailEnabled,
	},
] as const;

function featureColumn(
	feature: (typeof DOMAIN_FEATURES)[number],
): ColumnDef<Domain> {
	return {
		id: feature.id,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name={feature.icon} className="h-3 w-3" />
				<span className="whitespace-nowrap text-xs">{feature.label}</span>
			</div>
		),
		cell: ({ row }) => (
			<FeatureSwitch
				domainIds={[row.original.id]}
				domainName={row.original.domain}
				feature={feature.id}
				state={feature.pick(row.original) ? "on" : "off"}
				label={`${feature.label} for ${row.original.domain}`}
			/>
		),
	};
}

export const domainColumns: ColumnDef<Domain>[] = [
	{
		id: "select",
		size: 32,
		enableSorting: false,
		enableHiding: false,
		header: ({ table }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select all"
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(value === true)
					}
				/>
			</div>
		),
		cell: ({ row }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select row"
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onCheckedChange={(value) => row.toggleSelected(value === true)}
				/>
			</div>
		),
	},
	{
		id: "domain",
		enableHiding: false,
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="globe" className="h-3 w-3" />
				<span className="text-xs">Domain</span>
			</div>
		),
		cell: ({ row, table }) => {
			const domain = row.original;
			const meta = table.options.meta as DomainTableMeta | undefined;
			// A group's root reads as its name (reloop.sh → reloop); subdomains
			// under it keep their full hostname.
			const label = meta?.groupParentIds?.has(domain.id)
				? groupLabelOf(domain.domain)
				: domain.domain;
			return (
				<div className="flex min-w-0 items-center gap-1">
					<DomainFavicon
						domain={rootDomainOf(domain.domain)}
						fallbackClassName={getStatusColorClass(domain.status)}
					/>
					<Link
						href={`/domain/${domain.id}`}
						title={domain.domain}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-text-sub-600"
					>
						{label}
					</Link>
				</div>
			);
		},
	},
	{
		id: "status",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="activity" className="h-3 w-3" />
				<span className="text-xs">Status</span>
			</div>
		),
		cell: ({ row }) => <DomainStatusCell status={row.original.status} />,
	},
	...DOMAIN_FEATURES.map(featureColumn),
	{
		id: "createdAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="clock" className="h-3 w-3" />
				<span className="text-xs">Created At</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
					{row.original.createdAt
						? formatRelativeTime(row.original.createdAt)
						: "-"}
				</span>
			</div>
		),
	},
];
