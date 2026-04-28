"use client";

import { cn } from "@reloop/ui/cn";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import type { LanguageCode } from "../data";

const languages = [
	{ id: "nodejs" as LanguageCode, label: "Node.js", si: siNodedotjs },
	{ id: "python" as LanguageCode, label: "Python", si: siPython },
	{ id: "go" as LanguageCode, label: "Go", si: siGo },
	{ id: "php" as LanguageCode, label: "PHP", si: siPhp },
] as const;

export function LanguageBadges({
	value,
	onChange,
}: {
	value: LanguageCode;
	onChange: (lang: LanguageCode) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{languages.map((l) => {
				const isActive = value === l.id;
				return (
					<button
						key={l.id}
						type="button"
						onClick={() => onChange(l.id)}
						className={cn(
							"inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-label-xs transition-all duration-150",
							isActive
								? "border-stroke-strong-950 bg-bg-strong-950 text-text-white-0"
								: "border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
						)}
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="h-4 w-4 shrink-0"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							style={isActive ? { color: `#${l.si.hex}` } : undefined}
						>
							<path d={l.si.path} />
						</svg>
						<span className="font-medium text-label-xs">{l.label}</span>
					</button>
				);
			})}
		</div>
	);
}
