import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
import { rootDomainOf } from "./domain-groups";

export type DomainTableMeta = {
	/** Grouped child domain id → its group root, for the shortened label. */
	groupRootById?: ReadonlyMap<string, string>;
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

/**
 * Switch that turns a feature on/off for one domain, or for every domain in a
 * group. A mixed group shows off; switching it turns the feature on for all.
 */
export function FeatureSwitch({
	domainIds,
	feature,
	state,
	label,
}: {
	domainIds: string[];
	feature: DomainFeatureId;
	state: FeatureState;
	label: string;
}) {
	const toggle = useDomainFeatureToggle();
	return (
		<div
			className="flex items-center"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Switch.Root
				checked={state === "on"}
				onCheckedChange={(checked) => void toggle(domainIds, feature, checked)}
				aria-label={label}
				title={
					state === "mixed" ? "On for some domains in this group" : undefined
				}
			/>
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
			// Inside a group, show only what differs: mc.reloop.sh → mc.
			const groupRoot = meta?.groupRootById?.get(domain.id);
			const label =
				groupRoot && domain.domain.endsWith(`.${groupRoot}`)
					? domain.domain.slice(0, -(groupRoot.length + 1))
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
