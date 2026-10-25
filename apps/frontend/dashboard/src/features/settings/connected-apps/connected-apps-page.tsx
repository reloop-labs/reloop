import { authClient } from "@reloop/auth/client";
import type { ConnectedApp } from "@reloop/auth/server/connected-apps";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
	describeCapabilities,
	summarizeAccess,
} from "#/features/auth/consent/consent-request";
import { Initial } from "#/features/auth/consent/consent-ui";
import { isKnownApp, KnownAppGlyph } from "#/features/auth/known-app-mark";
import { useSessionQuery } from "#/features/auth/session-query";
import { formatTimeAgo } from "#/features/settings/security/security-utils";
import { TableEmptyState } from "#/features/settings/security/table-empty-state";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { queryKeys } from "#/lib/query-keys";

type RowStatus = "idle" | "confirming" | "revoking";

function grantKey(app: ConnectedApp): string {
	return `${app.user.id}:${app.clientId}`;
}

function hostOf(uri: string | null): string | null {
	if (!uri) return null;
	try {
		return new URL(uri).host;
	} catch {
		return null;
	}
}

function formatDate(iso: string | null): string | null {
	if (!iso) return null;
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function AppLogo({ app }: { app: ConnectedApp }) {
	const name = app.name ?? app.clientId;
	// Logos that fail to load fall through to the next option instead of
	// rendering the browser's broken-image glyph.
	const [knownFailed, setKnownFailed] = useState(false);
	const [iconFailed, setIconFailed] = useState(false);
	const known = !knownFailed && isKnownApp(name, [app.uri]);
	return (
		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
			{known ? (
				<KnownAppGlyph
					name={name}
					uris={[app.uri]}
					className="h-5 w-5"
					onError={() => setKnownFailed(true)}
				/>
			) : app.icon && !iconFailed ? (
				<img
					src={app.icon}
					alt=""
					className="h-5 w-5 object-contain"
					onError={() => setIconFailed(true)}
				/>
			) : app.applicationType === "native" ? (
				<Icon name="terminal" className="h-4 w-4 text-text-sub-600" />
			) : (
				<Initial name={name} className="h-full w-full text-xs" />
			)}
		</div>
	);
}

function MemberLabel({ app }: { app: ConnectedApp }) {
	const label = app.isOwn ? "You" : app.user.name || app.user.email;
	return (
		<span className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-sub-600">
			{app.user.image ? (
				<img
					src={app.user.image}
					alt=""
					className="h-4 w-4 flex-shrink-0 rounded-full object-cover"
				/>
			) : (
				<Initial
					name={app.user.name || app.user.email}
					className="h-4 w-4 rounded-full text-[9px]"
				/>
			)}
			<span className="truncate" title={app.user.email}>
				{label}
			</span>
		</span>
	);
}

const BASE_COLS = "minmax(0,1fr) 120px 120px 180px";
const MEMBER_COLS = "minmax(0,1fr) 160px 120px 120px 180px";

const AppSkeleton = ({ cols }: { cols: string }) => (
	<div style={{ gridTemplateColumns: cols }} className="grid px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-8 w-8 rounded-lg" />
			<div className="flex-1 space-y-1">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-3 w-48" />
			</div>
		</div>
		{cols === MEMBER_COLS && (
			<div className="flex items-center">
				<Skeleton className="h-4 w-20" />
			</div>
		)}
		<div className="flex items-center">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-16" />
		</div>
		<div className="flex items-center justify-end">
			<Skeleton className="h-7 w-24 rounded-lg" />
		</div>
	</div>
);

export function ConnectedAppsPage() {
	const queryClient = useQueryClient();
	const { data: session } = useSessionQuery();
	const { isOrgAdmin } = useOrgPermissions();
	const [statusMap, setStatusMap] = useState<Record<string, RowStatus>>({});

	const organizationId =
		(session?.session as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ?? null;
	const queryKey = queryKeys.auth.connectedApps(organizationId);

	const {
		data: apps = [],
		isPending: loading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey,
		queryFn: async (): Promise<ConnectedApp[]> => {
			const { data, error } = await authClient.connectedApps.list();
			if (error)
				throw new Error(error.message || "Failed to fetch connected apps");
			return data ?? [];
		},
		enabled: organizationId !== null,
		refetchOnWindowFocus: true,
	});

	const showMembers = apps.some((app) => !app.isOwn);

	const setStatus = (key: string, status: RowStatus) =>
		setStatusMap((prev) => ({ ...prev, [key]: status }));

	const canDisconnect = (app: ConnectedApp) => app.isOwn || isOrgAdmin;

	const handleDisconnect = async (app: ConnectedApp) => {
		const key = grantKey(app);
		setStatus(key, "revoking");
		try {
			const { error } = await authClient.connectedApps.revoke({
				clientId: app.clientId,
				userId: app.user.id,
			});
			if (error) throw new Error(error.message || "Failed to disconnect app");
			queryClient.setQueryData<ConnectedApp[]>(queryKey, (prev) =>
				(prev ?? []).filter((a) => grantKey(a) !== key),
			);
			toast.success(`${app.name ?? "App"} disconnected`);
		} catch {
			toast.error("Failed to disconnect app");
		} finally {
			setStatus(key, "idle");
		}
	};

	const cols = showMembers ? MEMBER_COLS : BASE_COLS;

	const showFooter = !loading && apps.length > 0;
	const footer = (
		<div className="flex items-center justify-between px-4 py-2">
			<p className="text-label-xs text-text-sub-600">
				{apps.length} connected app{apps.length > 1 ? "s" : ""}
			</p>
		</div>
	);

	return (
		<div className="space-y-4">
			<div>
				<p className="font-medium text-label-md text-text-strong-950">
					Connected Apps
				</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Apps, AI assistants, and CLIs with access to this organization.
				</p>
			</div>

			{/* Phones and tablets: the card (border drawn here) holds a sideways
			    scroller for the columns, and the footer below it stays put */}
			<div className="w-full text-paragraph-sm max-md:overflow-hidden max-md:rounded-[14px] max-md:border max-md:border-stroke-soft-100 dark:max-md:border-stroke-soft-100/70">
				<div className="w-full overflow-x-auto">
					{/* 720px = the column minimums, so the last column never spills out */}
					<div className="min-w-[720px]">
						<div
							style={{ gridTemplateColumns: cols }}
							className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs max-md:rounded-none max-md:border-0 max-md:pb-2.5 dark:border-[#101010] dark:bg-bg-weak-50/40"
						>
							<div className="flex items-center gap-1">
								<Icon name="plug-custom" className="h-3 w-3" />
								<span className="text-xs">App</span>
							</div>
							{showMembers && (
								<div className="flex items-center gap-1">
									<Icon name="user" className="h-3 w-3" />
									<span className="text-xs">Member</span>
								</div>
							)}
							<div className="flex items-center gap-1">
								<Icon name="calendar" className="h-3 w-3" />
								<span className="text-xs">Connected</span>
							</div>
							<div className="flex items-center gap-1">
								<Icon name="clock" className="h-3 w-3" />
								<span className="text-xs">Last Active</span>
							</div>
							<div />
						</div>

						<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 max-md:mt-0 max-md:rounded-none max-md:border-0 max-md:border-t dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
							{organizationId === null ? (
								<TableEmptyState
									icon="workspace-custom"
									title="No organization selected"
									description="Select an organization to see its connected apps."
								/>
							) : loading ? (
								Array.from({ length: 3 }).map((_, i) => (
									<AppSkeleton key={`skeleton-${i.toString()}`} cols={cols} />
								))
							) : apps.length === 0 ? (
								<TableEmptyState
									icon={isError ? "shield-cross" : "plug-custom"}
									title={
										isError
											? "Couldn't load connected apps"
											: "No connected apps"
									}
									description={
										isError
											? "Something went wrong while fetching connected apps."
											: "Apps authorized for this organization, like MCP clients or the Reloop CLI, will appear here."
									}
									action={
										isError ? (
											<Button.Root
												type="button"
												variant="neutral"
												mode="stroke"
												size="small"
												onClick={() => void refetch()}
												disabled={isRefetching}
												className="gap-1.5 rounded-xl"
											>
												<Icon
													name="refresh-cw"
													className="h-4 w-4 text-text-sub-600"
												/>
												Try again
											</Button.Root>
										) : null
									}
								/>
							) : (
								apps.map((app) => {
									const key = grantKey(app);
									const status = statusMap[key] ?? "idle";
									const name = app.name ?? "Unnamed app";
									const host = hostOf(app.uri);
									const access = summarizeAccess(
										describeCapabilities({
											scopes: app.scopes,
											resources: app.resources,
										}),
									);
									return (
										<div
											key={key}
											style={{ gridTemplateColumns: cols }}
											className="group/row grid w-full items-center px-4 py-2 text-left hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]"
										>
											<div className="flex min-w-0 items-center gap-3">
												<AppLogo app={app} />
												<div className="min-w-0 flex-1">
													<div className="flex min-w-0 items-center gap-2">
														<span className="truncate font-medium text-label-xs text-text-strong-950">
															{name}
														</span>
														{host && (
															<span className="truncate text-[11px] text-text-sub-600">
																{host}
															</span>
														)}
														{!app.hasActiveSession && (
															<span className="shrink-0 rounded-full border border-stroke-soft-100 px-1.5 text-[10px] text-text-sub-600 dark:border-stroke-soft-100/40">
																Idle
															</span>
														)}
													</div>
													<p
														className="truncate text-[11px] text-text-sub-600"
														title={access}
													>
														{access}
													</p>
												</div>
											</div>

											{showMembers && <MemberLabel app={app} />}

											<span className="text-label-xs text-text-sub-600">
												{formatDate(app.connectedAt) ?? "-"}
											</span>
											<span className="text-label-xs text-text-sub-600">
												{app.lastActiveAt
													? formatTimeAgo(new Date(app.lastActiveAt))
													: "-"}
											</span>

											<div className="flex items-center justify-end gap-2">
												{canDisconnect(app) && (
													<>
														{status === "confirming" && (
															<button
																type="button"
																className="h-7 rounded-lg px-2 font-medium text-text-sub-600 text-xs hover:text-text-strong-950"
																onClick={() => setStatus(key, "idle")}
															>
																Cancel
															</button>
														)}
														<FancyButton.Root
															variant="destructive"
															size="xsmall"
															className={cn(
																"min-w-[96px] justify-center overflow-hidden font-medium",
																status === "revoking" && "opacity-90",
															)}
															disabled={status === "revoking"}
															onClick={() =>
																status === "confirming"
																	? handleDisconnect(app)
																	: setStatus(key, "confirming")
															}
														>
															<AnimatePresence mode="popLayout" initial={false}>
																<motion.span
																	key={status}
																	transition={{
																		type: "spring",
																		duration: 0.25,
																		bounce: 0,
																	}}
																	initial={{ opacity: 0, y: -14 }}
																	animate={{ opacity: 1, y: 0 }}
																	exit={{ opacity: 0, y: 14 }}
																	className="flex items-center justify-center gap-1.5"
																>
																	{status === "revoking" ? (
																		<>
																			<Spinner
																				size={12}
																				color="var(--static-white)"
																			/>
																			<span>Disconnecting...</span>
																		</>
																	) : status === "confirming" ? (
																		"Confirm"
																	) : (
																		"Disconnect"
																	)}
																</motion.span>
															</AnimatePresence>
														</FancyButton.Root>
													</>
												)}
											</div>
										</div>
									);
								})
							)}
							{/* Desktop: footer inside the rows card, as before */}
							{showFooter && <div className="max-md:hidden">{footer}</div>}
						</div>
					</div>
				</div>
				{/* Phones/tablets: outside the scroller, so it never scrolls sideways. No top
			    border: divide-y already draws one under the last row (the hidden desktop
			    footer above is still the last child). */}
				{showFooter && (
					<div className="bg-bg-white-0 md:hidden dark:bg-black">{footer}</div>
				)}
			</div>
		</div>
	);
}
