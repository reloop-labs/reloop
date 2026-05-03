"use client";

import type { RemoteCursor } from "./hooks/useRemoteCursors";

interface RemoteCursorsProps {
	cursors: RemoteCursor[];
}

export function RemoteCursors({ cursors }: RemoteCursorsProps) {
	return (
		<>
			{cursors.map((cursor) => (
				<div
					key={cursor.clientId}
					className="pointer-events-none absolute z-50"
					style={{
						left: `${cursor.x}%`,
						top: `${cursor.y}%`,
						transform: "translate(0, 0)",
						transition: "left 80ms linear, top 80ms linear",
					}}
				>
					{/* Arrow SVG */}
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

					{/* Name label */}
					<div
						className="absolute top-1 left-4 whitespace-nowrap rounded px-1.5 py-0.5 font-semibold text-white text-xs"
						style={{ backgroundColor: cursor.color }}
					>
						{cursor.name}
					</div>
				</div>
			))}
		</>
	);
}
