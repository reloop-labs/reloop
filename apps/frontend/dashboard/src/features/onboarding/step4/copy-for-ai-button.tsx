import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import {
	siCursor,
	siVscodium,
	siWindsurf,
	siZedindustries,
} from "simple-icons";

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

/**
 * Compact "Copy for AI" control for the language-pills row.
 * Click copies the prompt; chevron opens editor shortcuts.
 */
export function CopyForAiButton({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [open, setOpen] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch {
			// ignore
		}
	};

	const openEditor = (editor: Editor) => {
		setOpen(false);
		window.open(editor.getUrl(prompt), "_blank");
	};

	return (
		<div className={cn("inline-flex shrink-0 items-center", className)}>
			{/* Primary: copy prompt */}
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="xsmall"
				onClick={() => void handleCopy()}
				className="gap-1.5 rounded-l-xl rounded-r-none border-r-0"
			>
				{copied ? (
					<>
						<Icon
							name="check-circle"
							className="size-3.5 shrink-0 text-green-600"
						/>
						<span>Copied</span>
					</>
				) : (
					<span>Copy for AI</span>
				)}
			</Button.Root>

			{/* Dropdown: open in editor */}
			<Dropdown.Root open={open} onOpenChange={setOpen}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						className="rounded-l-none rounded-r-xl px-1.5"
						aria-label="Open AI prompt in editor"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"size-3.5 transition-transform duration-200",
								open && "rotate-180",
							)}
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content align="end" className="w-[200px] rounded-xl p-1">
					<Dropdown.Item
						onClick={() => void handleCopy()}
						className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-text-strong-950 text-xs dark:text-white"
					>
						<span>Copy prompt</span>
					</Dropdown.Item>
					<div className="my-1 h-px bg-stroke-soft-200" />
					<p className="px-2 py-1 font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
						Open in
					</p>
					{EDITORS.map((editor) => (
						<Dropdown.Item
							key={editor.id}
							onClick={() => openEditor(editor)}
							className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-text-strong-950 text-xs dark:text-white"
						>
							<svg
								viewBox="0 0 24 24"
								className="size-3.5 shrink-0"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path d={editor.icon.path} />
							</svg>
							<span>{editor.name}</span>
						</Dropdown.Item>
					))}
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}
