"use client";

import { cn } from "@reloop/ui/cn";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import type { LanguageCode } from "../data";

const languages = [
	{ id: "nodejs" as LanguageCode, label: "Node.js", si: siNodedotjs },
	{ id: "python" as LanguageCode, label: "Python",  si: siPython },
	{ id: "go"     as LanguageCode, label: "Go",      si: siGo },
	{ id: "php"    as LanguageCode, label: "PHP",     si: siPhp },
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
			{languages.map((l) => (
				<button
					key={l.id}
					type="button"
					onClick={() => onChange(l.id)}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-label-xs transition-all duration-150",
						value === l.id
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
						<path d={l.si.path} />
					</svg>
					{l.label}
				</button>
			))}
		</div>
	);
}
