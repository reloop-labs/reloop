"use client";

import { cn } from "@reloop/ui/cn";
import { siBun, siNpm, siPnpm, siYarn } from "simple-icons";
import type { PackageManager } from "../data";

const managers = [
	{ id: "npm" as PackageManager, label: "npm", si: siNpm },
	{ id: "pnpm" as PackageManager, label: "pnpm", si: siPnpm },
	{ id: "yarn" as PackageManager, label: "yarn", si: siYarn },
	{ id: "bun" as PackageManager, label: "bun", si: siBun },
] as const;

export function PackageManagerBadges({
	value,
	onChange,
}: {
	value: PackageManager;
	onChange: (pm: PackageManager) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{managers.map((m) => (
				<button
					key={m.id}
					type="button"
					onClick={() => onChange(m.id)}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-label-xs transition-all duration-150",
						value === m.id
							? "border-stroke-strong-950 bg-bg-strong-950 text-text-white-0"
							: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-stroke-soft-300 hover:text-text-strong-950",
					)}
				>
					<svg
						role="img"
						viewBox="0 0 24 24"
						className="h-3.5 w-3.5 shrink-0"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d={m.si.path} />
					</svg>
					{m.label}
				</button>
			))}
		</div>
	);
}
