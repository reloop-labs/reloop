"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
	formatTimeAgo,
	getBrowserIcon,
	getOsIcon,
	parseUserAgent,
	type Session,
} from "./security-utils";

interface SessionManagementProps {
	className?: string;
}

const GRID_COLS = "grid-cols-[1fr_140px_140px_120px_80px]";
const DIVIDER = "divide-stroke-soft-100 dark:divide-[#101010]";
const BORDER = "border-stroke-soft-100 dark:border-stroke-soft-100/40";

export const SessionManagement = ({ className }: SessionManagementProps) => {
	const [terminatingSession, setTerminatingSession] = useState<string | null>(
		null,
	);
	const [terminatingAll, setTerminatingAll] = useState(false);
	const { data: currentSession } = authClient.useSession();

	const {
		data: sessions = [],
		isLoading: loading,
		mutate,
	} = useSWR<Session[]>(
		"active-sessions",
		async () => {
			const { data, error } = await authClient.listSessions();
			if (error) throw new Error(error.message || "Failed to fetch sessions");
			return data || [];
		},
		{
			revalidateOnFocus: false,
			onError: () => toast.error("Failed to load sessions"),
		},
	);

	const handleTerminateSession = async (token: string) => {
		setTerminatingSession(token);
		try {
			const { error } = await authClient.revokeSession({ token });
			if (error)
				throw new Error(error.message || "Failed to terminate session");
			mutate(
				sessions.filter((s) => s.token !== token),
				false,
			);
			toast.success("Session terminated successfully");
		} catch {
			toast.error("Failed to terminate session");
		} finally {
			setTerminatingSession(null);
		}
	};

	const handleTerminateAllSessions = async () => {
		setTerminatingAll(true);
		try {
			const { error } = await authClient.revokeOtherSessions();
			if (error)
				throw new Error(error.message || "Failed to terminate sessions");
			mutate(
				sessions.filter((s) => s.token === currentSession?.session?.token),
				false,
			);
			toast.success("All other sessions terminated successfully");
		} catch {
			toast.error("Failed to terminate all sessions");
		} finally {
			setTerminatingAll(false);
		}
	};

	const currentToken = currentSession?.session?.token;

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center justify-between">
				<div>
					<p className="font-medium text-label-md text-text-strong-950">
						Active Sessions
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Monitor and manage all your active sessions.
					</p>
				</div>
				{sessions.length > 1 && (
					<Button.Root
						variant="error"
						className="h-7 text-sm"
						size="xxsmall"
						onClick={handleTerminateAllSessions}
						disabled={terminatingAll || loading}
					>
						{terminatingAll && <Spinner size={12} color="var(--error-base)" />}
						Revoke All Other
					</Button.Root>
				)}
			</div>

			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/40">
				<div
					className={`grid ${GRID_COLS} items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40`}
				>
					<div className="flex items-center gap-1">
						<Icon name="monitor" className="h-3 w-3" />
						<span className="text-xs">Session</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="globe" className="h-3 w-3" />
						<span className="text-xs">IP Address</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="clock" className="h-3 w-3" />
						<span className="text-xs">Last Active</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="map-pin" className="h-3 w-3" />
						<span className="text-xs">Location</span>
					</div>
					<div />
				</div>

				<div className={`divide-y ${DIVIDER}`}>
					{loading
						? Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className={`grid ${GRID_COLS} px-4 py-2`}>
									<div className="flex items-center gap-3">
										<Skeleton className="h-5 w-5 rounded-full" />
										<div className="flex-1 space-y-1">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-32" />
										</div>
									</div>
									<div className="flex items-center">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center">
										<Skeleton className="h-4 w-16" />
									</div>
									<div className="flex items-center">
										<Skeleton className="h-4 w-24" />
									</div>
									<div className="flex items-center justify-end">
										<Skeleton className="h-6 w-6 rounded" />
									</div>
								</div>
							))
						: sessions.map((session, i) => {
								const { browser, device, isMobile } = parseUserAgent(
									session.userAgent,
								);
								const isCurrent = session.token === currentToken;

								return (
									<div
										key={
											session.id ? `session-${session.id}` : `session-idx-${i}`
										}
										className={cn(
											`group/row grid ${GRID_COLS} items-center px-4 py-2 transition-colors hover:bg-bg-weak-50/50`,
										)}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
												{getBrowserIcon(browser)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<span className="truncate font-medium text-label-xs text-text-strong-950">
														{browser}
													</span>
													{isCurrent && (
														<span className="rounded-full bg-success-base px-1.5 font-semibold text-[10px] text-white">
															Current
														</span>
													)}
												</div>
												<span className="flex items-center gap-1.5 text-[11px] text-text-sub-600">
													<span className="flex items-center gap-1">
														<span className="h-3 w-3">{getOsIcon(device)}</span>
														<span>{device}</span>
													</span>
													<span>•</span>
													<span className="flex items-center gap-1">
														<Icon
															name={isMobile ? "smartphone" : "monitor"}
															className="h-3 w-3 text-text-sub-600"
														/>
														<span>{isMobile ? "Mobile" : "Desktop"}</span>
													</span>
												</span>
											</div>
										</div>

										<span className="text-label-xs text-text-sub-600">
											{session.ipAddress || "—"}
										</span>
										<span className="text-label-xs text-text-sub-600">
											{formatTimeAgo(session.updatedAt)}
										</span>
										<span className="text-label-xs text-text-sub-600">
											{session.location || "Unknown"}
										</span>

										<div className="flex items-center justify-end">
											{isCurrent ? (
												<div
													className={`flex h-7 w-16 items-center justify-center rounded-lg border font-medium text-text-sub-600/70 text-xs ${BORDER}`}
												>
													Current
												</div>
											) : (
												<Button.Root
													variant="error"
													mode="lighter"
													size="xxsmall"
													className="text-xs"
													onClick={() => handleTerminateSession(session.token)}
													disabled={terminatingSession === session.token}
												>
													{terminatingSession === session.token ? (
														<Spinner size={12} color="var(--text-sub-600)" />
													) : (
														"Revoke"
													)}
												</Button.Root>
											)}
										</div>
									</div>
								);
							})}
					{!loading && sessions.length > 0 && (
						<div className={"flex items-center justify-between px-4 py-2.5"}>
							<p className="text-label-xs text-text-sub-600">
								{sessions.length} active session{sessions.length > 1 ? "s" : ""}
							</p>
						</div>
					)}
				</div>

				{!loading && sessions.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Icon name="shield" className="mb-3 h-8 w-8 text-text-sub-600" />
						<p className="font-medium text-text-strong-950">
							No active sessions
						</p>
						<p className="text-sm text-text-sub-600">
							Your sessions will appear here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
