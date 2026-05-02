"use client";

import { useState } from "react";

export interface SpacingValue {
	top: number | "";
	right: number | "";
	bottom: number | "";
	left: number | "";
}

const SIDES = ["top", "right", "bottom", "left"] as const;

export function SpacingControl({
	value,
	onChange,
	unit = "px",
}: {
	value: SpacingValue;
	onChange: (v: SpacingValue) => void;
	unit?: string;
}) {
	const [linked, setLinked] = useState(false);

	const handleChange = (side: keyof SpacingValue, raw: string) => {
		const num = raw === "" ? "" : Number.parseFloat(raw);
		if (linked) {
			onChange({ top: num, right: num, bottom: num, left: num });
		} else {
			onChange({ ...value, [side]: num });
		}
	};

	return (
		<div className="flex items-center gap-1">
			{SIDES.map((side) => (
				<span key={side} className="flex flex-col items-center gap-0.5">
					<input
						type="number"
						value={value[side]}
						onChange={(e) => handleChange(side, e.target.value)}
						className="w-10 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-center text-xs"
					/>
					<span className="text-[10px] text-(--re-text-muted) capitalize">
						{side[0]}
					</span>
				</span>
			))}
			{/* Link / unlink all sides */}
			<button
				type="button"
				title={linked ? "Unlink sides" : "Link all sides"}
				onClick={() => setLinked((v) => !v)}
				className={`ml-0.5 rounded border p-0.5 transition-colors ${
					linked
						? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
						: "border-(--re-border) bg-transparent text-(--re-text-muted)"
				}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{linked ? (
						<>
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
						</>
					) : (
						<>
							<path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.004 5.004 0 0 0-7.07.12l-1.72 1.71" />
							<path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.004 5.004 0 0 0 7.07-.12l1.71-1.71" />
							<line x1="8" y1="2" x2="8" y2="5" />
							<line x1="2" y1="8" x2="5" y2="8" />
							<line x1="16" y1="19" x2="16" y2="22" />
							<line x1="19" y1="16" x2="22" y2="16" />
						</>
					)}
				</svg>
			</button>
		</div>
	);
}
