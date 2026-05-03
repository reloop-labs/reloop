"use client";

import React from "react";
import type { AwarenessUser } from "./hooks/useCollaboration";

interface CollabPresenceProps {
	users: AwarenessUser[];
	currentUserId?: string;
}

export function CollabPresence({ users, currentUserId }: CollabPresenceProps) {
	if (users.length === 0) return null;

	const displayUsers = users.slice(0, 5);
	const overflow = users.length - 5;

	return (
		<div className="flex items-center gap-2">
			<div className="-space-x-2 flex">
				{displayUsers.map((user) => (
					<div key={user.clientId} className="group relative" title={user.name}>
						<div
							className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white font-semibold text-white text-xs ring-2 ring-transparent transition-all duration-150 group-hover:ring-2"
							style={{
								backgroundColor: user.color,
								"--tw-ring-color": user.color,
							} as React.CSSProperties}
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
							{user.name}
						</div>
					</div>
				))}

				{overflow > 0 && (
					<div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-semibold text-gray-600 text-xs">
						+{overflow}
					</div>
				)}
			</div>

			<span className="text-gray-400 text-xs">
				{users.length === 1
					? "1 person editing"
					: `${users.length} people editing`}
			</span>
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
