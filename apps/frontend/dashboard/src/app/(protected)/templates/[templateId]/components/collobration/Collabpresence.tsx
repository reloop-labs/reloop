"use client";

import type React from "react";
import type { PresenceUser } from "./hooks/usePresence";
import { usePresenceOthers, usePresenceSelf } from "./PresenceProvider";

// ── Avatar component ─────────────────────────────────────────────────────────

function UserAvatar({
	user,
	isSelf = false,
}: {
	user: PresenceUser;
	isSelf?: boolean;
}) {
	return (
		<div
			className="group relative"
			title={isSelf ? `${user.name} (you)` : user.name}
		>
			<div
				className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-semibold text-white text-xs transition-all duration-150 ${
					isSelf
						? "border-white opacity-70 ring-2"
						: "border-white ring-2 ring-transparent group-hover:ring-2"
				}`}
				style={
					{
						backgroundColor: user.color,
						"--tw-ring-color": user.color,
					} as React.CSSProperties
				}
			>
				{user.avatar ? (
					<img
						src={user.avatar}
						alt={user.name}
						className="h-full w-full rounded-full object-cover"
					/>
				) : (
					getInitials(user.name)
				)}
			</div>

			{/* Tooltip */}
			<div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
				{isSelf ? `${user.name} (you)` : user.name}
			</div>

			{/* Online dot */}
			{!isSelf && (
				<span className="-right-0.5 -bottom-0.5 absolute block h-2 w-2 rounded-full border border-white bg-green-400" />
			)}
		</div>
	);
}

// ── CollabPresence ────────────────────────────────────────────────────────────

const MAX_AVATARS = 4;

export function CollabPresence() {
	const self = usePresenceSelf();
	const others = usePresenceOthers() ?? [];

	const totalOthers = others.length;
	const visibleOthers = others.slice(0, MAX_AVATARS);
	const overflow = totalOthers - MAX_AVATARS;

	if (!self && totalOthers === 0) return null;

	return (
		<div className="flex items-center gap-2">
			<div className="-space-x-2 flex">
				{/* Self avatar — slightly dimmed so it's distinguishable */}
				{self && <UserAvatar key="self" user={self} isSelf />}

				{/* Others */}
				{visibleOthers.map((user) => (
					<UserAvatar key={user.clientId} user={user} />
				))}

				{/* Overflow badge */}
				{overflow > 0 && (
					<div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-semibold text-gray-600 text-xs">
						+{overflow}
					</div>
				)}
			</div>
		</div>
	);
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}
