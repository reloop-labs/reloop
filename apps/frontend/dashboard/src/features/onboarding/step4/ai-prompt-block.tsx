import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";
import {
	siCursor,
	siVscodium,
	siWindsurf,
	siZedindustries,
} from "simple-icons";
import { CopyCodeBlock } from "./copy-code-block";

type Editor = {
	id: string;
	name: string;
	icon: { path: string };
	getUrl: (prompt: string) => string;
};

const EDITORS: Editor[] = [
	{
		id: "cursor",
		name: "Cursor",
		icon: siCursor,
		getUrl: (prompt) => `cursor://?prompt=${encodeURIComponent(prompt)}`,
	},
	{
		id: "vscode",
		name: "VS Code",
		icon: siVscodium,
		getUrl: (prompt) => `vscode://?prompt=${encodeURIComponent(prompt)}`,
	},
	{
		id: "windsurf",
		name: "Windsurf",
		icon: siWindsurf,
		getUrl: (prompt) => `windsurf://?prompt=${encodeURIComponent(prompt)}`,
	},
	{
		id: "zed",
		name: "Zed",
		icon: siZedindustries,
		getUrl: (prompt) => `zed://?prompt=${encodeURIComponent(prompt)}`,
	},
];

export function AiPromptBlock({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const [activeEditorId, setActiveEditorId] = useState("cursor");
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem("reloop_preferred_editor");
			if (stored && EDITORS.some((e) => e.id === stored)) {
				setActiveEditorId(stored);
			}
		} catch {
			// ignore
		}
	}, []);

	const handleSelectEditor = (id: string) => {
		setActiveEditorId(id);
		setDropdownOpen(false);
		try {
			localStorage.setItem("reloop_preferred_editor", id);
		} catch {
			// ignore
		}
	};

	const activeEditor = (EDITORS.find((e) => e.id === activeEditorId) ||
		EDITORS[0]) as Editor;

	const actionButton = (
		<div className="inline-flex items-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-transparent">
			<button
				type="button"
				onClick={() => window.open(activeEditor.getUrl(prompt), "_blank")}
				className="inline-flex cursor-pointer items-center gap-1.5 rounded-l-lg px-2.5 py-1 font-medium text-[12px] text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-zinc-800 dark:hover:text-white"
			>
				<svg
					viewBox="0 0 24 24"
					className="h-3.5 w-3.5 shrink-0"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path d={activeEditor.icon.path} />
				</svg>
				Open in {activeEditor.name}
			</button>
			<div className="h-4 w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
			<Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<Dropdown.Trigger asChild>
					<button
						type="button"
						className="inline-flex cursor-pointer items-center justify-center rounded-r-lg px-1.5 py-1 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"h-3.5 w-3.5 transition-transform duration-200",
								dropdownOpen && "rotate-180",
							)}
						/>
					</button>
				</Dropdown.Trigger>
				<Dropdown.Content align="end" className="w-[180px] rounded-xl p-1">
					{EDITORS.map((editor) => {
						const isSelected = editor.id === activeEditorId;
						return (
							<Dropdown.Item
								key={editor.id}
								onClick={() => handleSelectEditor(editor.id)}
								className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-text-strong-950 text-xs transition-colors dark:text-white"
							>
								<div className="flex items-center gap-2">
									<svg
										viewBox="0 0 24 24"
										className="h-3.5 w-3.5 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path d={editor.icon.path} />
									</svg>
									<span>{editor.name}</span>
								</div>
								{isSelected && (
									<Icon
										name="check-circle"
										className="h-3.5 w-3.5 text-text-strong-950 dark:text-white"
									/>
								)}
							</Dropdown.Item>
						);
					})}
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);

	return (
		<CopyCodeBlock
			code={prompt}
			// Highlight as a .md source file (same as .ts/.js via Bright)
			lang="md"
			copyValue={prompt}
			label="prompt.md"
			title="AI prompt"
			icon={
				<Icon
					name="sparkling"
					className="h-4 w-4 shrink-0 text-text-strong-950 dark:text-white"
				/>
			}
			action={actionButton}
			hideLineNumbers
			noScroll
			maxHeight="240px"
			className={className}
		/>
	);
}
