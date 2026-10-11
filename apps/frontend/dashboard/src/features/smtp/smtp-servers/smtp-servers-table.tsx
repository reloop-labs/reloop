"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { toast } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	apiErrorMessage,
	type SmtpProvider,
	useTestSmtpProvider,
} from "../own-smtp/use-smtp-providers";
import { ReloopSmtpPanel } from "./reloop-smtp-panel";
import {
	type RowAction,
	RowActionsMenu,
	RowContextMenu,
} from "./row-actions-menu";

/** name · host · domains · status · last tested · added · actions */
const GRID = {
	gridTemplateColumns: "minmax(0,1fr) 210px 190px 120px 110px 100px 32px",
} as const;

const DOCS_URL = "https://reloop.sh/docs/examples/smtp/introduction";

function HeaderCell({ icon, label }: { icon: string; label: string }) {
	return (
		<div className="flex items-center gap-1">
			<Icon name={icon} className="h-3 w-3" />
			<span className="text-xs">{label}</span>
		</div>
	);
}

function Pill({ children, mono }: { children: ReactNode; mono?: boolean }) {
	return (
		<span
			className={cn(
				"truncate rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/20",
				mono && "font-mono",
			)}
		>
			{children}
		</span>
	);
}

function Muted({ children }: { children: ReactNode }) {
	return (
		<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
			{children}
		</span>
	);
}

function StatusCell({ provider }: { provider: SmtpProvider }) {
	const tone =
		provider.status === "ok"
			? { text: "Connected", icon: "check-circle", cls: "text-success-base" }
			: provider.status === "failing"
				? { text: "Failing", icon: "cross-circle", cls: "text-error-base" }
				: { text: "Not tested", icon: "clock", cls: "text-text-sub-600" };
	const content = (
		<span
			className={cn(
				"flex items-center gap-2 font-medium text-[13px]",
				tone.cls,
			)}
		>
			<Icon name={tone.icon} className="h-3.5 w-3.5 shrink-0" />
			{tone.text}
		</span>
	);
	if (provider.status !== "failing" || !provider.lastError) return content;
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<button type="button" className="cursor-help">
					{content}
				</button>
			</Tooltip.Trigger>
			<Tooltip.Content side="top">
				<p className="max-w-[260px] text-xs">{provider.lastError}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

function DomainsCell({ provider }: { provider: SmtpProvider }) {
	if (provider.domains.length === 0) return <Muted>No domains</Muted>;
	const [first, ...rest] = provider.domains;
	return (
		<div className="flex min-w-0 items-center gap-1">
			{first ? (
				<Link
					href={`/domain/${first.id}`}
					onClick={(e) => e.stopPropagation()}
					className="min-w-0 truncate rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:bg-bg-weak-50/20"
				>
					{first.domain}
				</Link>
			) : null}
			{rest.length > 0 ? (
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<span className="shrink-0 cursor-default font-medium text-[11px] text-text-soft-400">
							+{rest.length}
						</span>
					</Tooltip.Trigger>
					<Tooltip.Content side="top">
						<p className="text-xs">{rest.map((d) => d.domain).join(", ")}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			) : null}
		</div>
	);
}

function rowClass(active: boolean) {
	return cn(
		"group/row grid w-full items-center px-4 py-2 text-left",
		"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
		active && "bg-bg-weak-50/50 dark:bg-white/[0.06]",
	);
}

function ReloopRow({
	smtpHost,
	expanded,
	onToggle,
}: {
	smtpHost: string;
	expanded: boolean;
	onToggle: () => void;
}) {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const actions: RowAction[] = [
		{
			id: "setup",
			label: expanded ? "Hide setup" : "View setup",
			icon: "code",
			onSelect: onToggle,
		},
		{
			id: "copy-host",
			label: "Copy host",
			icon: "copy",
			onSelect: () => {
				void navigator.clipboard.writeText(smtpHost);
				toast.success("SMTP host copied");
			},
		},
		{
			id: "api-key",
			label: "Get API key",
			icon: "key-new",
			onSelect: () => router.push("/api-keys/create"),
		},
		{
			id: "docs",
			label: "Documentation",
			icon: "external-link",
			onSelect: () => window.open(DOCS_URL, "_blank"),
		},
	];

	return (
		<div>
			<RowContextMenu actions={actions} onOpenChange={setMenuOpen}>
				{/* biome-ignore lint/a11y/useSemanticElements: row holds the actions menu button, so it can't be a <button> */}
				<div
					role="button"
					tabIndex={0}
					aria-expanded={expanded}
					style={GRID}
					onClick={onToggle}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onToggle();
						}
					}}
					className={cn(rowClass(menuOpen || expanded), "cursor-pointer")}
				>
					<div className="flex min-w-0 items-center gap-2">
						<Icon
							name="chevron-right"
							className={cn(
								"h-3.5 w-3.5 shrink-0 text-text-soft-400 transition-transform duration-200",
								expanded && "rotate-90",
							)}
						/>
						<Icon name="smtp" className="h-4 w-4 shrink-0 text-text-sub-600" />
						<span className="truncate font-semibold text-label-sm text-text-strong-950 dark:text-white">
							Reloop SMTP
						</span>
						<span className="shrink-0 rounded-md bg-bg-white-0 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100">
							Built-in
						</span>
					</div>
					<div className="flex min-w-0 items-center">
						<Pill mono>{smtpHost}</Pill>
					</div>
					<Muted>All your domains</Muted>
					<span className="flex items-center gap-2 font-medium text-[13px] text-success-base">
						<Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" />
						Active
					</span>
					<Muted>—</Muted>
					<Muted>Included</Muted>
					<RowActionsMenu
						label="Reloop SMTP"
						actions={actions}
						onOpenChange={setMenuOpen}
					/>
				</div>
			</RowContextMenu>
			<AnimatePresence initial={false}>
				{expanded ? (
					<motion.div
						key="reloop-setup"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							height: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
							opacity: { duration: 0.2, ease: "easeOut" },
						}}
						className="overflow-hidden"
					>
						<ReloopSmtpPanel smtpHost={smtpHost} />
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

function ProviderRow({
	provider,
	canManage,
	onEdit,
	onDelete,
}: {
	provider: SmtpProvider;
	canManage: boolean;
	onEdit: (provider: SmtpProvider) => void;
	onDelete: (provider: SmtpProvider) => void;
}) {
	const test = useTestSmtpProvider();
	const [menuOpen, setMenuOpen] = useState(false);

	const runTest = async () => {
		const pending = toast.loading(`Connecting to ${provider.host}…`);
		try {
			const result = await test.mutateAsync(provider.id);
			toast.dismiss(pending);
			if (result.ok) toast.success(`Connected to ${provider.host}`);
			else toast.error(result.error ?? "Connection failed");
		} catch (err) {
			toast.dismiss(pending);
			toast.error(apiErrorMessage(err, "Connection test failed"));
		}
	};

	const actions: RowAction[] = [
		{
			id: "test",
			label: test.isPending ? "Testing…" : "Test connection",
			icon: "refresh-cw",
			disabled: test.isPending,
			onSelect: () => void runTest(),
		},
		{
			id: "edit",
			label: "Edit server",
			icon: "edit",
			onSelect: () => onEdit(provider),
		},
		{
			id: "copy-host",
			label: "Copy host",
			icon: "copy",
			onSelect: () => {
				void navigator.clipboard.writeText(provider.host);
				toast.success("Host copied");
			},
		},
		{
			id: "delete",
			label: "Delete server",
			icon: "trash",
			isDanger: true,
			onSelect: () => onDelete(provider),
		},
	];

	const row = (
		<div style={GRID} className={rowClass(menuOpen)}>
			<div className="flex min-w-0 items-center gap-2">
				<span className="w-3.5 shrink-0" />
				<Icon name="server" className="h-4 w-4 shrink-0 text-text-sub-600" />
				{canManage ? (
					<button
						type="button"
						onClick={() => onEdit(provider)}
						className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 dark:text-white"
					>
						{provider.name}
					</button>
				) : (
					<span className="truncate font-semibold text-label-sm text-text-strong-950 dark:text-white">
						{provider.name}
					</span>
				)}
			</div>
			<div className="flex min-w-0 items-center">
				<Pill mono>
					{provider.host}:{provider.port}
				</Pill>
			</div>
			<DomainsCell provider={provider} />
			<StatusCell provider={provider} />
			<Muted>
				{provider.lastTestedAt
					? formatRelativeTime(provider.lastTestedAt)
					: "Never"}
			</Muted>
			<Muted>{formatRelativeTime(provider.createdAt)}</Muted>
			{canManage ? (
				<RowActionsMenu
					label={provider.name}
					actions={actions}
					onOpenChange={setMenuOpen}
				/>
			) : (
				<div />
			)}
		</div>
	);

	return canManage ? (
		<RowContextMenu actions={actions} onOpenChange={setMenuOpen}>
			{row}
		</RowContextMenu>
	) : (
		row
	);
}

/** Inline call to action under the built-in row when the org has no servers. */
function OwnSmtpPrompt({
	entitled,
	canManage,
	onAdd,
}: {
	entitled: boolean;
	canManage: boolean;
	onAdd: () => void;
}) {
	return (
		<div className="flex flex-col items-center px-6 py-10 text-center dark:bg-bg-weak-50/30">
			<Icon name="server" className="mb-3 h-7 w-7 text-text-sub-600" />
			<h3 className="mb-1.5 font-semibold text-lg text-text-strong-950">
				Already have an SMTP server?
			</h3>
			<p className="mx-auto mb-5 max-w-[360px] text-balance font-medium text-[12px] text-text-sub-600">
				Connect SendGrid, Postmark, Microsoft 365 or your own Postfix. We add
				your domain automatically, with no DNS setup, and keep templates,
				tracking, logs and webhooks in Reloop.
			</p>
			{!canManage ? (
				<p className="font-medium text-[12px] text-text-soft-400">
					Ask an organization admin to connect one.
				</p>
			) : entitled ? (
				<FancyButton.Root
					type="button"
					variant="neutral"
					size="small"
					onClick={onAdd}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Add SMTP server
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-black/25 dark:bg-black/10 dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			) : (
				<Link
					href="/settings/billing/plans"
					className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-stroke-soft-200 px-3 font-medium text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50"
				>
					<Icon name="zap" className="h-3.5 w-3.5" />
					Available on Pro and above
				</Link>
			)}
		</div>
	);
}

export function SmtpServersTable({
	smtpHost,
	providers,
	isLoading,
	entitled,
	canManage,
	onAdd,
	onEdit,
	onDelete,
}: {
	smtpHost: string;
	providers: SmtpProvider[];
	isLoading: boolean;
	entitled: boolean;
	canManage: boolean;
	onAdd: () => void;
	onEdit: (provider: SmtpProvider) => void;
	onDelete: (provider: SmtpProvider) => void;
}) {
	// Built-in row starts open when it's the only thing to look at.
	const [reloopOpen, setReloopOpen] = useState<boolean | null>(null);
	const expanded = reloopOpen ?? (!isLoading && providers.length === 0);

	return (
		<div className="w-full overflow-x-auto text-paragraph-sm">
			<div className="min-w-[880px]">
				<div
					style={GRID}
					className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
				>
					<HeaderCell icon="smtp" label="Server" />
					<HeaderCell icon="link" label="Host" />
					<HeaderCell icon="globe" label="Domains" />
					<HeaderCell icon="activity" label="Status" />
					<HeaderCell icon="history" label="Last Tested" />
					<HeaderCell icon="calendar" label="Added" />
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
					<ReloopRow
						smtpHost={smtpHost}
						expanded={expanded}
						onToggle={() => setReloopOpen(!expanded)}
					/>
					{isLoading && providers.length === 0 ? (
						<div style={GRID} className="grid items-center px-4 py-2.5">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-14" />
							<Skeleton className="h-4 w-14" />
							<div />
						</div>
					) : providers.length === 0 ? (
						<OwnSmtpPrompt
							entitled={entitled}
							canManage={canManage}
							onAdd={onAdd}
						/>
					) : (
						providers.map((provider) => (
							<ProviderRow
								key={provider.id}
								provider={provider}
								canManage={canManage}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
