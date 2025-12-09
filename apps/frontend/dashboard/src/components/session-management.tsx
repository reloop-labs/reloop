"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

export const SessionManagement = ({ className }: SessionManagementProps) => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);
	const [terminatingSession, setTerminatingSession] = useState<string | null>(
		null,
	);
	const [terminatingAll, setTerminatingAll] = useState(false);
	const { data: currentSession } = authClient.useSession();

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const { data, error } = await authClient.listSessions();

				if (error) {
					throw new Error(error.message || "Failed to fetch sessions");
				}

				setSessions(data || []);
			} catch (error) {
				toast.error("Failed to load sessions");
				setSessions([]);
			} finally {
				setLoading(false);
			}
		};

		fetchSessions();
	}, []);

	const handleTerminateSession = async (token: string) => {
		setTerminatingSession(token);
		try {
			const { error } = await authClient.revokeSession({ token });

			if (error) {
				throw new Error(error.message || "Failed to terminate session");
			}

			setSessions((prev) => prev.filter((session) => session.token !== token));
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
			setSessions((prev) =>
				prev.filter((session) => session.token === currentSession?.session?.token),
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
		const iconClass = "h-4 w-4";
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
				return <Icon name="globe" className="h-4 w-4 text-text-sub-600" />;
		}
	};

	// Get OS icon component
	const getOsIcon = (device: string) => {
		const iconClass = "h-4 w-4";
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
			return <Icon name="server" className="h-4 w-4 text-text-sub-600" />;
		}
		if (deviceLower.includes("android")) {
			return <Icon name="smartphone" className="h-4 w-4 text-text-sub-600" />;
		}
		return <Icon name="laptop" className="h-4 w-4 text-text-sub-600" />;
	};

	// Get device type icon (mobile or desktop)
	const getDeviceTypeIcon = (isMobile: boolean) => {
		return isMobile ? (
			<Icon name="smartphone" className="h-4 w-4 text-text-sub-600" />
		) : (
			<Icon name="monitor" className="h-4 w-4 text-text-sub-600" />
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
				<div className="flex items-center justify-center py-12">
					<Spinner size={20} color="var(--text-strong-950)" />
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
						mode="stroke"
						size="xsmall"
						onClick={handleTerminateAllSessions}
						disabled={terminatingAll}
					>
						{terminatingAll ? (
							<Spinner size={14} color="var(--error-base)" />
						) : (
							<Icon name="log-out" className="h-4 w-4" />
						)}
						Log Out All
					</Button.Root>
				)}
			</div>

			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[minmax(60px,auto)_1fr_minmax(120px,auto)_minmax(120px,auto)_minmax(50px,auto)]">
					{/* Header */}
					<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
						<div className="py-2.5 text-gray-800 dark:text-gray-200">
							Device
						</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5 text-gray-800 dark:text-gray-200">
							Browser
						</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5 text-gray-800 dark:text-gray-200">
							IP Address
						</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5 text-gray-800 dark:text-gray-200">
							Last Active
						</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5" />
					</div>

					{/* Rows */}
					{sessions.map((session) => {
						const { browser, device, isMobile } = parseUserAgent(session.userAgent);
						const isCurrent = isCurrentSession(session);

						return (
							<div key={session.id} className="group/row contents">
								{/* Device Column - shows OS icon and device type */}
								<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
									<div className="flex items-center gap-2 pl-5">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-weak-50">
											{getOsIcon(device)}
										</div>
										<div className="flex h-6 w-6 items-center justify-center">
											{getDeviceTypeIcon(isMobile)}
										</div>
									</div>
								</div>

								{/* Browser Column - shows browser icon and info */}
								<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
									<div className="flex items-center gap-3">
										<div className="flex h-6 w-6 items-center justify-center">
											{getBrowserIcon(browser)}
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium text-label-sm text-text-strong-950">
												{browser} on {device}
											</span>
											{isCurrent && (
												<span className="rounded-full bg-primary-light px-2 py-0.5 font-medium text-primary-base text-xs">
													This device
												</span>
											)}
										</div>
									</div>
								</div>

								{/* IP Address Column */}
								<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
									<span className="text-label-sm text-text-strong-950">
										{session.ipAddress || "--"}
									</span>
								</div>

								{/* Last Active Column */}
								<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
									<span className="text-label-sm text-text-sub-600">
										{formatTimeAgo(session.updatedAt)}
									</span>
								</div>

								{/* Action Column */}
								<div className="flex items-center justify-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
									{!isCurrent && (
										<Button.Root
											variant="error"
											mode="ghost"
											size="xxsmall"
											onClick={() => handleTerminateSession(session.token)}
											disabled={terminatingSession === session.token}
										>
											{terminatingSession === session.token ? (
												<Spinner size={14} color="var(--error-base)" />
											) : (
												<Icon name="x" className="h-4 w-4" />
											)}
										</Button.Root>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};


