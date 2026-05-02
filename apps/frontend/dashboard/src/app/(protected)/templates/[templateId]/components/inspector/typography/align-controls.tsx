import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import React from "react";

const ALIGN_OPTIONS = [
	{ value: "left" as const, icon: AlignLeft, label: "Align left" },
	{ value: "center" as const, icon: AlignCenter, label: "Align center" },
	{ value: "right" as const, icon: AlignRight, label: "Align right" },
];

export function AlignControls({
	alignment,
	setAlignment,
}: {
	alignment: string;
	setAlignment: (alignment: any) => void;
}) {
	return (
		<div className="flex items-center gap-1 rounded-2xl bg-bg-weak-50 p-1">
			{ALIGN_OPTIONS.map(({ value: a, icon: Icon, label }) => (
				<button
					key={a}
					type="button"
					title={label}
					aria-label={label}
					aria-pressed={alignment === a}
					onClick={() => setAlignment(a)}
					className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 ${
						alignment === a
							? "border border-stroke-soft-200 bg-bg-white-0 shadow-sm text-text-strong-950"
							: "text-text-sub-600 hover:bg-bg-strong-950/5 hover:text-text-strong-950"
					}`}
				>
					<Icon className="h-4 w-4" strokeWidth={2} />
				</button>
			))}
		</div>
	);
}
