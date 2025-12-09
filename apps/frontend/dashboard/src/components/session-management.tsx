"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
	Safari,
	Chrome,
	BraveBrowser,
	Firefox,
	Edge,
	Opera,
	Windows,
	Apple,
	Ubuntu,
} from "@fe/dashboard/app/(protected)/[orgSlug]/settings/security/session-icons";

interface Session {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
}

interface SessionManagementProps {
	className?: string;
}

// Parse user agent to extract browser, device type, and OS info
const parseUserAgent = (userAgent: string | null | undefined) => {
	if (!userAgent) return { browser: "Unknown", device: "Unknown", isMobile: false };

	let browser = "Unknown";
	let device = "Unknown";
	let isMobile = false;

	// Detect browser
	if (userAgent.includes("Brave")) {
		browser = "Brave";
	} else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
		browser = "Chrome";
	} else if (userAgent.includes("Firefox")) {
		browser = "Firefox";
	} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
		browser = "Safari";
	} else if (userAgent.includes("Edg")) {
		browser = "Edge";
	} else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
		browser = "Opera";
	}

	// Detect device/OS
	if (userAgent.includes("Mac OS X")) {
		device = "macOS";
	} else if (userAgent.includes("Windows")) {
		device = "Windows";
	} else if (userAgent.includes("Ubuntu")) {
		device = "Ubuntu";
	} else if (userAgent.includes("Linux") && !userAgent.includes("Android")) {
		device = "Linux";
	} else if (userAgent.includes("Android")) {
		device = "Android";
		isMobile = true;
	} else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
		device = "iOS";
		isMobile = userAgent.includes("iPhone");
	}

	// Also check for mobile indicators
	if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
		isMobile = true;
	}

	return { browser, device, isMobile };
};

/**
 * Get animation properties for staggered animations
 */
const getAnimationProps = (row: number, column: number) => {
	return {
		initial: { opacity: 0, y: "-100%" },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: "100%" },
		transition: {
			duration: 0.5,
			delay: row * 0.07 + column * 0.1,
			ease: [0.65, 0, 0.35, 1] as const,
		},
	};
};

export const SessionManagement = ({ className }: SessionManagementProps) => {
	const [terminatingSession, setTerminatingSession] = useState<string | null>(
		null,
	);
	const [terminatingAll, setTerminatingAll] = useState(false);
	const { data: currentSession } = authClient.useSession();

	const { data: sessions = [], isLoading: loading, mutate } = useSWR<Session[]>(
		"active-sessions",
		async () => {
			const { data, error } = await authClient.listSessions();
			if (error) {
				throw new Error(error.message || "Failed to fetch sessions");
			}
			return data || [];
		},
		{
			revalidateOnFocus: false,
			onError: () => {
				toast.error("Failed to load sessions");
			},
		}
	);

	const handleTerminateSession = async (token: string) => {
		setTerminatingSession(token);
		try {
			const { error } = await authClient.revokeSession({ token });

			if (error) {
				throw new Error(error.message || "Failed to terminate session");
			}

			mutate(sessions.filter((session) => session.token !== token), false);
			toast.success("Session terminated successfully");
		} catch (error) {
			toast.error("Failed to terminate session");
		} finally {
			setTerminatingSession(null);
		}
	};

	const handleTerminateAllSessions = async () => {
		setTerminatingAll(true);
		try {
			const { error } = await authClient.revokeOtherSessions();

			if (error) {
				throw new Error(error.message || "Failed to terminate sessions");
			}

			// Keep only the current session
			mutate(
				sessions.filter((session) => session.token === currentSession?.session?.token),
				false
			);
			toast.success("All other sessions terminated successfully");
		} catch (error) {
			toast.error("Failed to terminate all sessions");
		} finally {
			setTerminatingAll(false);
		}
	};

	// Get browser icon component
	const getBrowserIcon = (browser: string) => {
		const iconClass = "h-full w-full";
		switch (browser) {
			case "Chrome":
				return <Chrome className={iconClass} />;
			case "Firefox":
				return <Firefox className={iconClass} />;
			case "Safari":
				return <Safari className={iconClass} />;
			case "Edge":
				return <Edge className={iconClass} />;
			case "Opera":
				return <Opera className={iconClass} />;
			case "Brave":
				return <BraveBrowser className={iconClass} />;
			default:
				return <Icon name="globe" className="h-full w-full text-text-sub-600" />;
		}
	};

	// Get OS icon component
	const getOsIcon = (device: string) => {
		const iconClass = "h-full w-full";
		const deviceLower = device.toLowerCase();
		if (deviceLower.includes("macos") || deviceLower.includes("ios")) {
			return <Apple className={iconClass} />;
		}
		if (deviceLower.includes("windows")) {
			return <Windows className={iconClass} />;
		}
		if (deviceLower.includes("ubuntu")) {
			return <Ubuntu className={iconClass} />;
		}
		if (deviceLower.includes("linux")) {
			return <Icon name="server" className="h-full w-full text-text-sub-600" />;
		}
		if (deviceLower.includes("android")) {
			return <Icon name="smartphone" className="h-full w-full text-text-sub-600" />;
		}
		return <Icon name="laptop" className="h-full w-full text-text-sub-600" />;
	};

	// Get device type icon (mobile or desktop)
	const getDeviceTypeIcon = (isMobile: boolean) => {
		return isMobile ? (
			<Icon name="smartphone" className="h-3 w-3 text-text-sub-600" />
		) : (
			<Icon name="monitor" className="h-3 w-3 text-text-sub-600" />
		);
	};

	const formatTimeAgo = (date: Date) => {
		const now = new Date();
		const dateObj = new Date(date);
		const diffInHours = Math.floor(
			(now.getTime() - dateObj.getTime()) / (1000 * 60 * 60),
		);

		if (diffInHours < 1) {
			return "just now";
		}
		if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
		}
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
	};

	const isCurrentSession = (session: Session) => {
		return session.token === currentSession?.session?.token;
	};

	if (loading) {
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
				</div>

				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm shadow-regular-md">
					{/* Table Header */}
					<div className="grid grid-cols-[1fr_140px_140px_120px] border-b border-stroke-soft-200 bg-bg-weak-50">
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							Session
						</div>
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							IP Address
						</div>
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							Last Active
						</div>
						<div className="px-4 py-3" />
					</div>

					{/* Skeleton Rows */}
					<div className="divide-y divide-stroke-soft-200">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={`skeleton-${index}`}
								className="grid grid-cols-[1fr_140px_140px_120px]"
							>
								{/* Session Info Column */}
								<div className="flex items-center gap-3 px-4 py-3">
									<Skeleton className="h-10 w-10 rounded-xl" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-32" />
									</div>
								</div>

								{/* IP Address Column */}
								<div className="flex items-center px-4 py-3">
									<Skeleton className="h-4 w-20" />
								</div>

								{/* Last Active Column */}
								<div className="flex items-center px-4 py-3">
									<Skeleton className="h-4 w-16" />
								</div>

								{/* Action Column */}
								<div className="flex items-center justify-end px-4 py-3">
									<Skeleton className="h-7 w-20 rounded-lg" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

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
						mode="lighter"
						size="xsmall"
						onClick={handleTerminateAllSessions}
						disabled={terminatingAll}
					>
						{terminatingAll ? (
							<Spinner size={14} color="var(--error-base)" />
						) : (
							<Icon name="logout" className="h-4 w-4" />
						)}
						Revoke All Sessions
					</Button.Root>
				)}
			</div>

			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm shadow-regular-md">
					{/* Table Header */}
					<div className="grid grid-cols-[1fr_140px_140px_120px] border-b border-stroke-soft-200 bg-bg-weak-50">
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							Session
						</div>
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							IP Address
						</div>
						<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							Last Active
						</div>
						<div className="px-4 py-3" />
					</div>

					{/* Table Body */}
					<div className="divide-y divide-stroke-soft-200">
						{sessions.map((session, index) => {
							const { browser, device, isMobile } = parseUserAgent(session.userAgent);
							const isCurrent = isCurrentSession(session);

							return (
								<div
									key={session.id}
									className={cn(
										"group/row grid grid-cols-[1fr_140px_140px_120px] transition-colors",
										isCurrent
											? "bg-primary-light/20 hover:bg-primary-light/30"
											: "hover:bg-bg-weak-50/50"
									)}
								>
									{/* Session Info Column */}
									<div className="flex items-center gap-3 px-4 py-3">
										{/* Combined Device Badge */}
										<motion.div
											{...getAnimationProps(index + 1, 0)}
											className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 ring-1 ring-stroke-soft-200"
										>
											<div className="h-5 w-5">
												{getBrowserIcon(browser)}
											</div>
											{/* OS Badge */}
											<div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-bg-white-0 ring-1 ring-stroke-soft-200">
												<div className="h-3 w-3">
													{getOsIcon(device)}
												</div>
											</div>
										</motion.div>

										{/* Session Details */}
										<motion.div
											{...getAnimationProps(index + 1, 1)}
											className="min-w-0 flex-1"
										>
											<div className="flex items-center gap-2">
												<span className="truncate font-medium text-label-sm text-text-strong-950">
													{browser}
												</span>
												{isCurrent && (
													<span className="flex items-center gap-1 rounded-full bg-success-lighter px-2 py-0.5 text-xs text-success-base">
														<span className="h-1.5 w-1.5 rounded-full bg-success-base" />
														Current
													</span>
												)}
											</div>
											<div className="flex items-center gap-1.5 text-text-sub-600 text-xs">
												<span>{device}</span>
												<span>•</span>
												<span className="flex items-center gap-1">
													{getDeviceTypeIcon(isMobile)}
													{isMobile ? "Mobile" : "Desktop"}
												</span>
											</div>
										</motion.div>
									</div>

									{/* IP Address Column */}
									<div className="flex items-center px-4 py-3">
										<motion.span
											{...getAnimationProps(index + 1, 2)}
											className="font-mono text-label-sm text-text-sub-600"
										>
											{session.ipAddress || "—"}
										</motion.span>
									</div>

									{/* Last Active Column */}
									<div className="flex items-center px-4 py-3">
										<motion.span
											{...getAnimationProps(index + 1, 3)}
											className="text-label-sm text-text-sub-600"
										>
											{formatTimeAgo(session.updatedAt)}
										</motion.span>
									</div>

									{/* Action Column */}
									<div className="flex items-center justify-end px-4 py-3">
										{!isCurrent && (
											<motion.div {...getAnimationProps(index + 1, 4)}>
												<Button.Root
													variant="error"
													mode="ghost"
													size="xsmall"
													onClick={() => handleTerminateSession(session.token)}
													disabled={terminatingSession === session.token}
												>
													{terminatingSession === session.token ? (
														<Spinner size={14} color="var(--error-base)" />
													) : (
														<Icon name="logout" className="h-4 w-4" />
													)}
													Revoke
												</Button.Root>
											</motion.div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Empty State */}
					{sessions.length === 0 && (
						<motion.div
							className="flex flex-col items-center justify-center py-12 text-center"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
						>
							<Icon name="shield" className="mb-3 h-8 w-8 text-text-sub-600" />
							<p className="font-medium text-text-strong-950">No active sessions</p>
							<p className="text-sm text-text-sub-600">
								Your session is the only active one.
							</p>
						</motion.div>
					)}
				</div>
			</AnimatePresence>
		</div>
	);
};
