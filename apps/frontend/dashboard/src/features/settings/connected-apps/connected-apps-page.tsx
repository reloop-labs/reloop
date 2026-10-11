import { authClient } from "@reloop/auth/client";
import type { ConnectedApp } from "@reloop/auth/server/connected-apps";
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
import { useSessionQuery } from "#/features/auth/session-query";
import { formatTimeAgo } from "#/features/settings/security/security-utils";
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

/**
 * Bundled logos for well-known clients, matched on the registered name. They
 * win over a client-supplied `logo_uri`, which is self-reported by whoever
 * registered the client.
 */
const KNOWN_APP_ICONS: { pattern: RegExp; src: string }[] = [
	{ pattern: /antigravity/i, src: "/apps/antigravity.svg" },
];

function knownAppIcon(name: string): string | null {
	return KNOWN_APP_ICONS.find((entry) => entry.pattern.test(name))?.src ?? null;
}

function AppLogo({ app }: { app: ConnectedApp }) {
	const name = app.name ?? app.clientId;
	const icon = knownAppIcon(name) ?? app.icon;
	return (
		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
			{icon ? (
				<img src={icon} alt="" className="h-5 w-5 object-contain" />
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

const AppSkeleton = () => (
	<div className="flex items-center justify-between px-4 py-3">
		<div className="flex items-center gap-3">
			<Skeleton className="h-8 w-8 rounded-lg" />
			<div className="space-y-1.5">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-3 w-48" />
			</div>
		</div>
		<Skeleton className="h-7 w-24 rounded-lg" />
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

	const { data: apps = [], isPending: loading } = useQuery({
		queryKey,
		queryFn: async (): Promise<ConnectedApp[]> => {
			const { data, error } = await authClient.connectedApps.list();
			if (error)
				throw new Error(error.message || "Failed to fetch connected apps");
			return data ?? [];
		},
		enabled: organizationId !== null,
		refetchOnWindowFocus: false,
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

	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
					Connected Apps
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
					{isOrgAdmin
						? "Apps, AI assistants, and CLIs that members have allowed to access this organization."
						: "Apps, AI assistants, and CLIs you've allowed to access this organization."}
				</p>
			</div>

			<div className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:divide-[#101010] dark:border-stroke-soft-100/40">
				{loading && organizationId !== null
					? Array.from({ length: 3 }).map((_, i) => (
							<AppSkeleton key={`skeleton-${i.toString()}`} />
						))
					: apps.map((app) => {
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
							const connected = formatDate(app.connectedAt);
							return (
								<div
									key={key}
									className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-bg-weak-50/50 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="flex min-w-0 items-center gap-3">
										<AppLogo app={app} />
										<div className="min-w-0 space-y-0.5">
											<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
												<span className="truncate font-medium text-label-xs text-text-strong-950">
													{name}
												</span>
												{host && (
													<span className="truncate text-[11px] text-text-sub-600">
														{host}
													</span>
												)}
												{!app.hasActiveSession && (
													<span className="rounded-full border border-stroke-soft-100 px-1.5 text-[10px] text-text-sub-600 dark:border-stroke-soft-100/40">
														Idle
													</span>
												)}
											</div>
											<p className="truncate text-[11px] text-text-sub-600">
												{access}
											</p>
											<div className="flex flex-wrap items-center gap-x-2 text-[11px] text-text-soft-400">
												{showMembers && <MemberLabel app={app} />}
												<span>
													{[
														connected ? `Connected ${connected}` : null,
														app.lastActiveAt
															? `Last active ${formatTimeAgo(new Date(app.lastActiveAt))}`
															: null,
													]
														.filter(Boolean)
														.join(" · ")}
												</span>
											</div>
										</div>
									</div>

									{canDisconnect(app) && (
										<div className="flex flex-shrink-0 items-center gap-2">
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
										</div>
									)}
								</div>
							);
						})}
				{!loading && apps.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Icon name="link" className="mb-3 h-8 w-8 text-text-sub-600" />
						<p className="font-medium text-text-strong-950">
							No connected apps
						</p>
						<p className="text-sm text-text-sub-600">
							Apps authorized for this organization, like MCP clients or the
							Reloop CLI, will appear here.
						</p>
					</div>
				)}
				{organizationId === null && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="font-medium text-text-strong-950">
							No organization selected
						</p>
						<p className="text-sm text-text-sub-600">
							Select an organization to see its connected apps.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
