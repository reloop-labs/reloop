import { useState } from "react";

export interface BorderRadiusValue {
	topLeft: number | "";
	topRight: number | "";
	bottomRight: number | "";
	bottomLeft: number | "";
}

const CORNERS = [
	{ key: "topLeft", label: "TL" },
	{ key: "topRight", label: "TR" },
	{ key: "bottomRight", label: "BR" },
	{ key: "bottomLeft", label: "BL" },
] as const;

import * as Button from "@reloop/ui/button";

export function BorderRadiusControl({
	value,
	onChange,
}: {
	value: BorderRadiusValue;
	onChange: (v: BorderRadiusValue) => void;
}) {
	const [linked, setLinked] = useState(true);

	const handleChange = (corner: keyof BorderRadiusValue, raw: string) => {
		const num = raw === "" ? "" : Number.parseFloat(raw);
		if (linked) {
			onChange({
				topLeft: num,
				topRight: num,
				bottomRight: num,
				bottomLeft: num,
			});
		} else {
			onChange({ ...value, [corner]: num });
		}
	};

	return (
		<div className="flex items-center gap-1">
			{CORNERS.map(({ key, label }) => (
				<span key={key} className="flex flex-col items-center gap-0.5">
					<input
						type="number"
						min={0}
						value={value[key]}
						onChange={(e) => handleChange(key, e.target.value)}
						className="w-10 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-center text-xs"
					/>
					<span className="text-(--re-text-muted) text-[10px]">{label}</span>
				</span>
			))}
			<Button.Root
				type="button"
				variant="neutral"
				mode={linked ? "lighter" : "ghost"}
				size="xxsmall"
				title={linked ? "Unlink corners" : "Link all corners"}
				onClick={() => setLinked((v) => !v)}
				className={`ml-0.5 rounded border p-0.5 outline-none ring-0 transition-colors ${
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
					<rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
				</svg>
			</Button.Root>
		</div>
	);
}
