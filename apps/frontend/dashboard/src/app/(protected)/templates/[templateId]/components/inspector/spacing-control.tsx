"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Spacing control — diamond TRBL layout with centre link toggle       */
/* ------------------------------------------------------------------ */
export interface SpacingValue {
	top: number | "";
	right: number | "";
	bottom: number | "";
	left: number | "";
}

function SpinInput({
	value,
	onChange,
	label,
}: {
	value: number | "";
	onChange: (v: number | "") => void;
	label: string;
}) {
	return (
		<div className="flex flex-col items-center gap-0.5">
			<input
				type="number"
				value={value}
				onChange={(e) => {
					const raw = e.target.value;
					onChange(raw === "" ? "" : Number.parseFloat(raw));
				}}
				className="w-10 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-1 py-1 text-center text-xs text-text-strong-950 outline-none transition-colors focus:border-primary-base focus:ring-1 focus:ring-primary-base/20"
			/>
			<span className="text-[9px] font-medium uppercase tracking-widest text-text-sub-600">
				{label}
			</span>
		</div>
	);
}

export function SpacingControl({
	value,
	onChange,
}: {
	value: SpacingValue;
	onChange: (v: SpacingValue) => void;
	unit?: string;
}) {
	const [linked, setLinked] = useState(false);

	const handleChange = (side: keyof SpacingValue, raw: number | "") => {
		if (linked) {
			onChange({ top: raw, right: raw, bottom: raw, left: raw });
		} else {
			onChange({ ...value, [side]: raw });
		}
	};

	return (
		<div className="flex flex-col items-center gap-1.5 py-1">
			{/* Top */}
			<SpinInput
				value={value.top}
				onChange={(v) => handleChange("top", v)}
				label="T"
			/>

			{/* Middle row: Left — link button — Right */}
			<div className="flex items-center gap-2">
				<SpinInput
					value={value.left}
					onChange={(v) => handleChange("left", v)}
					label="L"
				/>

				{/* Link / unlink button */}
				<button
					type="button"
					title={linked ? "Unlink sides" : "Link all sides"}
					onClick={() => setLinked((v) => !v)}
					className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-150 ${
						linked
							? "border-primary-base bg-primary-base text-white shadow-sm"
							: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-primary-base hover:text-primary-base"
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

				<SpinInput
					value={value.right}
					onChange={(v) => handleChange("right", v)}
					label="R"
				/>
			</div>

			{/* Bottom */}
			<SpinInput
				value={value.bottom}
				onChange={(v) => handleChange("bottom", v)}
				label="B"
			/>
		</div>
	);
}
