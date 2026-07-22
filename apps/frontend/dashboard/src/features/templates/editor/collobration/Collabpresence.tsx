import { cn } from "@reloop/ui/cn";
import type React from "react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { ConnectionStatus as ConnectionStatusType } from "./hooks/useCollaboration";
import type { PresenceUser } from "./hooks/usePresence";
import { usePresenceOthers, usePresenceSelf } from "./PresenceProvider";

// ── Avatar component ─────────────────────────────────────────────────────────

interface UserAvatarProps {
	user: PresenceUser;
	isSelf?: boolean;
	statusConfig?: {
		dot: string;
		label: string;
		border: string;
	} | null;
}

function UserAvatar({ user, isSelf = false, statusConfig }: UserAvatarProps) {
	const displayName = user.name || user.email || "Anonymous";

	return (
		<div className="group/avatar relative">
			<div
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-white text-xs uppercase tracking-wide shadow-sm transition-all duration-150",
					isSelf ? statusConfig?.border || "border-white" : "border-white",
					user.email ? getAvatarGradient(user.email) : "",
				)}
				style={
					{
						backgroundColor: user.email ? undefined : user.color,
					} as React.CSSProperties
				}
			>
				{user.avatar ? (
					<img
						src={user.avatar}
						alt={displayName}
						className="h-full w-full rounded-full object-cover"
					/>
				) : (
					getAvatarInitial(user.name ?? null, user.email || "")
				)}
			</div>

			{/* Tooltip */}
			<div className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 font-medium text-white text-xs opacity-0 shadow-sm transition-opacity group-hover/avatar:opacity-100">
				{isSelf && statusConfig ? (
					<div className="flex items-center gap-1.5">
						<span className="text-gray-300">{displayName} (you)</span>
						<span className="text-gray-500">•</span>
						<span className="text-white">{statusConfig.label}</span>
					</div>
				) : isSelf ? (
					`${displayName} (you)`
				) : (
					displayName
				)}
				<div className="-ml-1 absolute bottom-full left-1/2 border-4 border-transparent border-b-gray-900" />
			</div>

			{/* Status dot for self (connection status) */}
			{isSelf && statusConfig && (
				<span
					className={`-right-0.5 -bottom-0.5 absolute z-10 block h-3 w-3 rounded-full border-2 border-white dark:border-gray-950 ${statusConfig.dot}`}
				/>
			)}

			{/* Online dot for others */}
			{!isSelf && (
				<span className="-right-0.5 -bottom-0.5 absolute z-10 block h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-950" />
			)}
		</div>
	);
}

// ── CollabPresence ────────────────────────────────────────────────────────────

const MAX_AVATARS = 4;

interface CollabPresenceProps {
	status?: ConnectionStatusType;
	isSynced?: boolean;
}

export function CollabPresence({ status, isSynced }: CollabPresenceProps) {
	const self = usePresenceSelf();
	const others = usePresenceOthers() ?? [];

	const totalOthers = others.length;
	const visibleOthers = others.slice(0, MAX_AVATARS);
	const overflow = totalOthers - MAX_AVATARS;

	const statusConfig = status
		? {
				connecting: {
					dot: "bg-yellow-400 animate-pulse",
					label: "Connecting...",
					border: "border-yellow-400",
				},
				connected: {
					dot: isSynced ? "bg-green-500" : "bg-blue-400 animate-pulse",
					label: isSynced ? "Live" : "Syncing...",
					border: isSynced ? "border-green-500" : "border-blue-400",
				},
				disconnected: {
					dot: "bg-gray-400",
					label: "Offline",
					border: "border-gray-400",
				},
				error: {
					dot: "bg-red-500",
					label: "Error",
					border: "border-red-500",
				},
			}[status]
		: null;

	if (!self && totalOthers === 0 && !statusConfig) return null;

	return (
		<div className="flex items-center gap-2 pr-1">
			<div className="-space-x-2 flex items-center">
				{/* Self avatar — slightly dimmed so it's distinguishable */}
				{self && (
					<UserAvatar
						key="self"
						user={self}
						isSelf
						statusConfig={statusConfig}
					/>
				)}

				{/* Others */}
				{visibleOthers.map((user) => (
					<UserAvatar key={user.clientId} user={user} />
				))}

				{/* Overflow badge */}
				{overflow > 0 && (
					<div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 font-semibold text-gray-600 text-xs shadow-sm">
						+{overflow}
					</div>
				)}

				{/* Connection indicator when no avatars */}
				{!self && totalOthers === 0 && statusConfig && (
					<div className="group/avatar relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 border-dashed bg-gray-50 transition-colors hover:border-gray-400">
						<span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
						<div className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 font-medium text-white text-xs opacity-0 shadow-sm transition-opacity group-hover/avatar:opacity-100">
							{statusConfig.label}
							<div className="-ml-1 absolute bottom-full left-1/2 border-4 border-transparent border-b-gray-900" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
