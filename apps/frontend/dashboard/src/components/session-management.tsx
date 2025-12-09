"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Table from "@reloop/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

// Parse user agent to extract browser and device info
const parseUserAgent = (userAgent: string | null | undefined) => {
	if (!userAgent) return { browser: "Unknown", device: "Unknown" };

	let browser = "Unknown";
	let device = "Unknown";

	// Detect browser
	if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
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
	} else if (userAgent.includes("Linux") && !userAgent.includes("Android")) {
		device = "Linux";
	} else if (userAgent.includes("Android")) {
		device = "Android";
	} else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
		device = "iOS";
	}

	return { browser, device };
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

	const getDeviceIcon = (device: string) => {
		if (device.toLowerCase().includes("macos")) {
			return "laptop";
		}
		if (device.toLowerCase().includes("ios")) {
			return "smartphone";
		}
		if (device.toLowerCase().includes("android")) {
			return "smartphone";
		}
		if (device.toLowerCase().includes("windows")) {
			return "monitor";
		}
		if (device.toLowerCase().includes("linux")) {
			return "server";
		}
		return "laptop";
	};

	const getBrowserIcon = (browser: string) => {
		if (browser.toLowerCase().includes("chrome")) {
			return "chrome";
		}
		if (browser.toLowerCase().includes("firefox")) {
			return "firefox";
		}
		if (browser.toLowerCase().includes("safari")) {
			return "safari";
		}
		if (browser.toLowerCase().includes("edge")) {
			return "edge";
		}
		return "globe";
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
			<div className={cn("space-y-6", className)}>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-lg text-text-strong-950">
							Active Sessions
						</h2>
						<p className="text-paragraph-sm text-text-sub-600">
							Monitor and manage all your active sessions.
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
						<span className="text-paragraph-sm text-text-sub-600">
							Loading sessions...
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg text-text-strong-950">
						Active Sessions
					</h2>
					<p className="text-paragraph-sm text-text-sub-600">
						Monitor and manage all your active sessions.
					</p>
				</div>
				{sessions.length > 1 && (
					<Button.Root
						variant="error"
						mode="stroke"
						size="small"
						onClick={handleTerminateAllSessions}
						disabled={terminatingAll}
					>
						{terminatingAll ? (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-error-base border-t-transparent" />
						) : (
							<Icon name="log-out" className="h-4 w-4" />
						)}
						Log Out All Sessions
					</Button.Root>
				)}
			</div>

			<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head className="w-12" />
							<Table.Head>Browser</Table.Head>
							<Table.Head>IP Address</Table.Head>
							<Table.Head>Last Active</Table.Head>
							<Table.Head className="w-20" />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{sessions.map((session) => {
							const { browser, device } = parseUserAgent(session.userAgent);
							const isCurrent = isCurrentSession(session);

							return (
								<Table.Row key={session.id}>
									<Table.Cell>
										<div className="flex items-center justify-center">
											<Icon
												name={getDeviceIcon(device)}
												className="h-5 w-5 text-text-sub-600"
											/>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center gap-3">
											<Icon
												name={getBrowserIcon(browser)}
												className="h-5 w-5 text-text-sub-600"
											/>
											<div>
												<div className="flex items-center gap-2">
													<span className="font-medium text-text-strong-950">
														{device}
													</span>
													{isCurrent && (
														<span className="rounded-full bg-primary-light px-2 py-0.5 font-medium text-primary-base text-xs">
															This device
														</span>
													)}
												</div>
												<p className="text-paragraph-sm text-text-sub-600">
													{browser}
												</p>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<span className="text-paragraph-sm text-text-strong-950">
											{session.ipAddress || "--"}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-paragraph-sm text-text-sub-600">
											{formatTimeAgo(session.updatedAt)}
										</span>
									</Table.Cell>
									<Table.Cell>
										{!isCurrent && (
											<Button.Root
												variant="error"
												mode="ghost"
												size="xsmall"
												onClick={() => handleTerminateSession(session.token)}
												disabled={terminatingSession === session.token}
											>
												{terminatingSession === session.token ? (
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-error-base border-t-transparent" />
												) : (
													<Icon name="x" className="h-4 w-4" />
												)}
											</Button.Root>
										)}
									</Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	);
};
