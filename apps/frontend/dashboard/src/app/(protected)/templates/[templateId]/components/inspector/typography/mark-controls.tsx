import {
	Bold,
	CaseSensitive,
	Code,
	Italic,
	Strikethrough,
	Underline,
} from "lucide-react";
import React from "react";
import { MarkButton } from "../mark-button";

const MARK_OPTIONS = [
	{ mark: "bold", icon: Bold, label: "Bold" },
	{ mark: "italic", icon: Italic, label: "Italic" },
	{ mark: "underline", icon: Underline, label: "Underline" },
	{ mark: "strike", icon: Strikethrough, label: "Strikethrough" },
	{ mark: "code", icon: Code, label: "Code" },
	{ mark: "case", icon: CaseSensitive, label: "Case" },
];

export function MarkControls({
	marks,
	toggleMark,
}: {
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-2xl bg-bg-weak-50 p-1">
			{MARK_OPTIONS.map(({ mark, icon, label }) => (
				<MarkButton
					key={mark}
					icon={icon}
					label={label}
					active={(marks as any)[mark] ?? false}
					onClick={() => toggleMark(mark as any)}
				/>
			))}
		</div>
	);
}
