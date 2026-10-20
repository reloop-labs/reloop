"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { toast } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { ActionKbd, actionKbdOnSolidClassName } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	apiErrorMessage,
	type SmtpProvider,
	useTestSmtpProvider,
} from "../own-smtp/use-smtp-providers";
import {
	type RowAction,
	RowActionsMenu,
	RowContextMenu,
} from "./row-actions-menu";

/** name · host · domains · status · last tested · added · actions */
const GRID = {
	gridTemplateColumns: "minmax(0,1fr) 210px 190px 120px 110px 100px 32px",
} as const;

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
	const { data: session } = useSessionQuery();
	const me = session?.user?.email;
	const [menuOpen, setMenuOpen] = useState(false);

	const runTest = async (to?: string) => {
		const pending = toast.loading(
			to ? `Sending a test email to ${to}…` : `Connecting to ${provider.host}…`,
		);
		try {
			const result = await test.mutateAsync({ id: provider.id, to });
			toast.dismiss(pending);
			if (result.ok) {
				toast.success(
					to ? `Test email sent to ${to}` : `Connected to ${provider.host}`,
				);
			} else toast.error(result.error ?? "Connection failed");
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
		...(me
			? [
					{
						id: "send-test",
						label: "Send test email",
						icon: "mail-send",
						disabled: test.isPending,
						onSelect: () => void runTest(me),
					},
				]
			: []),
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

/** Empty state for the bring-your-own table. */
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
				Connect your first SMTP server
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
					Connect to SMTP Server
					<ActionKbd className={actionKbdOnSolidClassName}>
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
	providers,
	isLoading,
	entitled,
	canManage,
	onAdd,
	onEdit,
	onDelete,
}: {
	providers: SmtpProvider[];
	isLoading: boolean;
	entitled: boolean;
	canManage: boolean;
	onAdd: () => void;
	onEdit: (provider: SmtpProvider) => void;
	onDelete: (provider: SmtpProvider) => void;
}) {
	return (
		<div className="w-full overflow-x-auto text-paragraph-sm">
			<div className="min-w-[880px]">
				<div
					style={GRID}
					className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
				>
					<HeaderCell icon="server" label="Server" />
					<HeaderCell icon="link" label="Host" />
					<HeaderCell icon="globe" label="Domains" />
					<HeaderCell icon="activity" label="Status" />
					<HeaderCell icon="history" label="Last Tested" />
					<HeaderCell icon="calendar" label="Added" />
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
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
