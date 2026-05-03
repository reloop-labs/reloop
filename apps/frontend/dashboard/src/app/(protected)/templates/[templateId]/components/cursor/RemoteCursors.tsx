"use client";

import { memo } from "react";
import type { RemoteCursor } from "./hooks/useRemoteCursors";

interface RemoteCursorsProps {
	cursors: RemoteCursor[];
}

// Memoized so only the specific cursor that moved re-renders,
// not the whole list on every awareness update.
const CursorDot = memo(function CursorDot({ cursor }: { cursor: RemoteCursor }) {
	return (
		<div
			className="pointer-events-none absolute z-50"
			style={{
				left: `${cursor.x}%`,
				top: `${cursor.y}%`,
				transition: "left 80ms linear, top 80ms linear",
			}}
		>
			<svg
				width="18"
				height="24"
				viewBox="0 0 18 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M0.219576 0.219576L10.7322 17.7322L6.21968 13.2197L1.46968 22.4697L0.219576 0.219576Z"
					fill={cursor.color}
					stroke="white"
					strokeWidth="1"
				/>
			</svg>
			<div
				className="absolute top-1 left-4 whitespace-nowrap rounded px-1.5 py-0.5 font-semibold text-white text-xs"
				style={{ backgroundColor: cursor.color }}
			>
				{cursor.name}
			</div>
		</div>
	);
});

export function RemoteCursors({ cursors }: RemoteCursorsProps) {
	return (
		<>
			{cursors.map((cursor) => (
				<CursorDot key={cursor.clientId} cursor={cursor} />
			))}
		</>
	);
}
