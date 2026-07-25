import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
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

export function SessionManagement({ className }: SessionManagementProps) {
	const queryClient = useQueryClient();
	const [statusMap, setStatusMap] = useState<
		Record<string, "idle" | "revoking" | "success">
	>({});
	const [statusAll, setStatusAll] = useState<"idle" | "revoking" | "success">(
		"idle",
	);
	const { data: currentSession } = useSessionQuery();

	const {
		data: sessions = [],
		isPending: loading,
	} = useQuery({
		queryKey: queryKeys.auth.sessions(),
		queryFn: async (): Promise<Session[]> => {
			const { data, error } = await authClient.listSessions();
			if (error) throw new Error(error.message || "Failed to fetch sessions");
			return (data as Session[]) || [];
		},
		refetchOnWindowFocus: false,
	});

	const setSessionsCache = (next: Session[]) => {
		queryClient.setQueryData(queryKeys.auth.sessions(), next);
	};

	const handleTerminateSession = async (token: string) => {
		setStatusMap((prev) => ({ ...prev, [token]: "revoking" }));
		try {
			const { error } = await authClient.revokeSession({ token });
			if (error)
				throw new Error(error.message || "Failed to terminate session");
			setSessionsCache(sessions.filter((s) => s.token !== token));
			setStatusMap((prev) => ({ ...prev, [token]: "success" }));
			setTimeout(() => {
				setStatusMap((prev) => ({ ...prev, [token]: "idle" }));
			}, 1500);
		} catch {
			toast.error("Failed to terminate session");
			setStatusMap((prev) => ({ ...prev, [token]: "idle" }));
		}
	};

	const handleTerminateAllSessions = async () => {
		setStatusAll("revoking");
		try {
			const { error } = await authClient.revokeOtherSessions();
			if (error)
				throw new Error(error.message || "Failed to terminate sessions");
			setSessionsCache(
				sessions.filter((s) => s.token === currentSession?.session?.token),
			);
			setStatusAll("success");
			setTimeout(() => {
				setStatusAll("idle");
			}, 1500);
		} catch {
			toast.error("Failed to terminate all sessions");
			setStatusAll("idle");
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
					<FancyButton.Root
						variant={statusAll === "success" ? "success" : "destructive"}
						size="xsmall"
						className={cn(
							"min-w-[140px] justify-center overflow-hidden transition-all duration-200 font-medium",
							statusAll === "revoking" && "opacity-90",
						)}
						onClick={handleTerminateAllSessions}
						disabled={statusAll !== "idle" || loading}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={statusAll}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5 font-medium"
							>
								{statusAll === "revoking" ? (
									<>
										<Spinner size={12} color="var(--static-white)" />
										<span>Revoking...</span>
									</>
								) : statusAll === "success" ? (
									<>
										<Icon name="check-circle" className="h-4 w-4" />
										<span>Revoked!</span>
									</>
								) : (
									"Revoke All Other"
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				)}
			</div>

			<div className="w-full overflow-x-auto text-paragraph-sm">
				<div
					className={`grid min-w-[640px] ${GRID_COLS} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40`}
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

				<div
					className={cn(
						"-mt-2.5 min-w-[640px] divide-y overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40",
						DIVIDER,
					)}
				>
					{loading
						? Array.from({ length: 3 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
									key={i}
									className={`grid ${GRID_COLS} px-4 py-2`}
								>
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
												(() => {
													const itemStatus =
														statusMap[session.token] ?? "idle";
													return (
														<FancyButton.Root
															variant={
																itemStatus === "success"
																	? "success"
																	: "destructive"
															}
															size="xsmall"
															className={cn(
																"min-w-[80px] justify-center overflow-hidden transition-all duration-200 font-medium",
																itemStatus === "revoking" && "opacity-90",
															)}
															onClick={() =>
																handleTerminateSession(session.token)
															}
															disabled={itemStatus !== "idle"}
														>
															<AnimatePresence mode="popLayout" initial={false}>
																<motion.span
																	key={itemStatus}
																	transition={{
																		type: "spring",
																		duration: 0.25,
																		bounce: 0,
																	}}
																	initial={{ opacity: 0, y: -14 }}
																	animate={{ opacity: 1, y: 0 }}
																	exit={{ opacity: 0, y: 14 }}
																	className="flex items-center justify-center gap-1.5 font-medium"
																>
																	{itemStatus === "revoking" ? (
																		<>
																			<Spinner
																				size={12}
																				color="var(--static-white)"
																			/>
																			<span>Revoking...</span>
																		</>
																	) : itemStatus === "success" ? (
																		<>
																			<Icon
																				name="check-circle"
																				className="h-3.5 w-3.5"
																			/>
																			<span>Revoked</span>
																		</>
																	) : (
																		"Revoke"
																	)}
																</motion.span>
															</AnimatePresence>
														</FancyButton.Root>
													);
												})()
											)}
										</div>
									</div>
								);
							})}
					{!loading && sessions.length > 0 && (
						<div className="flex items-center justify-between px-4 py-2.5">
							<p className="text-label-xs text-text-sub-600">
								{sessions.length} active session{sessions.length > 1 ? "s" : ""}
							</p>
						</div>
					)}
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
		</div>
	);
}
