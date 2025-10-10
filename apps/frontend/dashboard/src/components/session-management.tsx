"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Table from "@reloop/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Session {
	id: string;
	device: string;
	browser: string;
	location?: string;
	ipAddress?: string;
	createdAt: string;
	lastActiveAt: string;
	isCurrent?: boolean;
}

interface SessionManagementProps {
	className?: string;
}

export const SessionManagement = ({ className }: SessionManagementProps) => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);
	const [terminatingSession, setTerminatingSession] = useState<string | null>(
		null,
	);

	// Mock data for demonstration - replace with actual Better Auth session fetching
	const mockSessions: Session[] = [
		{
			id: "1",
			device: "macOS",
			browser: "Chrome 138.0.0.0",
			location: "Vancouver, Canada",
			ipAddress: "224.0.1.1",
			createdAt: new Date().toISOString(),
			lastActiveAt: new Date().toISOString(),
			isCurrent: true,
		},
		{
			id: "2",
			device: "iOS",
			browser: "Mobile Safari 18.5",
			location: "Québec, Canada",
			ipAddress: "226.0.1.1",
			createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
			lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "3",
			device: "Windows",
			browser: "Mozilla Firefox 120.0",
			location: "Paris, France",
			ipAddress: "227.0.1.1",
			createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			lastActiveAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "4",
			device: "Linux",
			browser: "Google Chrome 119.0",
			location: "Berlin, Germany",
			ipAddress: "228.0.1.1",
			createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
			lastActiveAt: new Date(
				Date.now() - 1 * 24 * 60 * 60 * 1000,
			).toISOString(),
		},
		{
			id: "5",
			device: "Android",
			browser: "Chrome Mobile 119.0",
			location: "Tokyo, Japan",
			ipAddress: "229.0.1.1",
			createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			lastActiveAt: new Date(
				Date.now() - 2 * 24 * 60 * 60 * 1000,
			).toISOString(),
		},
	];

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await fetch("/api/sessions");
				if (!response.ok) {
					throw new Error("Failed to fetch sessions");
				}
				const { sessions } = await response.json();
				setSessions(sessions);
			} catch (error) {
				console.error("Error fetching sessions:", error);
				toast.error("Failed to load sessions");
				// Fallback to mock data
				setSessions(mockSessions);
			} finally {
				setLoading(false);
			}
		};

		fetchSessions();
	}, []);

	const handleTerminateSession = async (sessionId: string) => {
		setTerminatingSession(sessionId);
		try {
			const response = await fetch(`/api/sessions?sessionId=${sessionId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to terminate session");
			}

			setSessions((prev) => prev.filter((session) => session.id !== sessionId));
			toast.success("Session terminated successfully");
		} catch (error) {
			console.error("Error terminating session:", error);
			toast.error("Failed to terminate session");
		} finally {
			setTerminatingSession(null);
		}
	};

	const handleTerminateAllSessions = async () => {
		try {
			// TODO: Implement actual session termination for all sessions
			// await authClient.terminateAllSessions();

			// Mock implementation
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setSessions((prev) => prev.filter((session) => session.isCurrent));
			toast.success("All other sessions terminated successfully");
		} catch (error) {
			console.error("Error terminating all sessions:", error);
			toast.error("Failed to terminate all sessions");
		}
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

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60),
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

	if (loading) {
		return (
			<div className={cn("space-y-6", className)}>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-2xl text-text-strong-950">
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
					<h2 className="font-semibold text-2xl text-text-strong-950">
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
					>
						<Icon name="log-out" className="h-4 w-4" />
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
							<Table.Head>Location</Table.Head>
							<Table.Head>IP Address</Table.Head>
							<Table.Head>Last Active</Table.Head>
							<Table.Head className="w-20" />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{sessions.map((session) => (
							<Table.Row key={session.id}>
								<Table.Cell>
									<div className="flex items-center justify-center">
										<Icon
											name={getDeviceIcon(session.device)}
											className="h-5 w-5 text-text-sub-600"
										/>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-3">
										<Icon
											name={getBrowserIcon(session.browser)}
											className="h-5 w-5 text-text-sub-600"
										/>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium text-text-strong-950">
													{session.device}
												</span>
												{session.isCurrent && (
													<span className="rounded-full bg-primary-light px-2 py-0.5 font-medium text-primary-base text-xs">
														This device
													</span>
												)}
											</div>
											<p className="text-paragraph-sm text-text-sub-600">
												{session.browser}
											</p>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<span className="text-paragraph-sm text-text-strong-950">
										{session.location || "Unknown"}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-paragraph-sm text-text-strong-950">
										{session.ipAddress || "--"}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-paragraph-sm text-text-sub-600">
										{formatTimeAgo(session.lastActiveAt)}
									</span>
								</Table.Cell>
								<Table.Cell>
									{!session.isCurrent && (
										<Button.Root
											variant="error"
											mode="ghost"
											size="xsmall"
											onClick={() => handleTerminateSession(session.id)}
											disabled={terminatingSession === session.id}
										>
											{terminatingSession === session.id ? (
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-error-base border-t-transparent" />
											) : (
												<Icon name="x" className="h-4 w-4" />
											)}
										</Button.Root>
									)}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	);
};
