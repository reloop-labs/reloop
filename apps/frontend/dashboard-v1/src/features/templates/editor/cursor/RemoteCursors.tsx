import { memo } from "react";
import type { RemoteCursor } from "./hooks/useRemoteCursors";

interface RemoteCursorsProps {
	cursors: RemoteCursor[];
}

// Memoized so only the specific cursor that moved re-renders,
// not the whole list on every awareness update.
const CursorDot = memo(function CursorDot({
	cursor,
}: {
	cursor: RemoteCursor;
}) {
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
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
			>
				<path
					d="M20.5056 10.7754C21.1225 10.5355 21.431 10.4155 21.5176 10.2459C21.5926 10.099 21.5903 9.92446 21.5115 9.77954C21.4205 9.61226 21.109 9.50044 20.486 9.2768L4.59629 3.5728C4.0866 3.38983 3.83175 3.29835 3.66514 3.35605C3.52029 3.40621 3.40645 3.52004 3.35629 3.6649C3.29859 3.8315 3.39008 4.08635 3.57304 4.59605L9.277 20.4858C9.50064 21.1088 9.61246 21.4203 9.77973 21.5113C9.92465 21.5901 10.0991 21.5924 10.2461 21.5174C10.4157 21.4308 10.5356 21.1223 10.7756 20.5054L13.3724 13.8278C13.4194 13.707 13.4429 13.6466 13.4792 13.5957C13.5114 13.5506 13.5508 13.5112 13.5959 13.479C13.6468 13.4427 13.7072 13.4192 13.828 13.3722L20.5056 10.7754Z"
					fill={cursor.color}
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<div
				className="absolute top-4 left-4 whitespace-nowrap rounded-full px-2 py-0.5 font-medium text-[10px] text-white shadow-sm"
				style={{ backgroundColor: cursor.color }}
			>
				{cursor.name || cursor.email || "Anonymous"}
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
