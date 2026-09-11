"use client";

import { MarkdownRenderer } from "@fe/console/components/ui/markdown-renderer";
import { cn } from "@reloop/ui/cn";
import {
	ArrowUp,
	Bold,
	Code,
	Eye,
	FileCode,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Loader2,
	PenLine,
	Quote,
} from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface SupportComposerProps {
	draft: string;
	setDraft: (value: string) => void;
	onSend: () => Promise<void> | void;
	disabled?: boolean;
	sending?: boolean;
	placeholder?: string;
}

export function SupportComposer({
	draft,
	setDraft,
	onSend,
	disabled = false,
	sending = false,
	placeholder = "Write a reply… (Enter to send, Shift+Enter for line)",
}: SupportComposerProps) {
	const [mode, setMode] = useState<"write" | "preview">("write");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea height
	const adjustHeight = useCallback(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 42), 160)}px`;
	}, []);

	useEffect(() => {
		if (mode === "write") {
			adjustHeight();
		}
	}, [draft, mode, adjustHeight]);

	const wrapSelection = (before: string, after: string, defaultText = "") => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const val = textarea.value;
		const selected = val.slice(start, end);
		const text = selected || defaultText;
		const replacement = `${before}${text}${after}`;
		const nextVal = val.slice(0, start) + replacement + val.slice(end);

		setDraft(nextVal);

		requestAnimationFrame(() => {
			textarea.focus();
			const newStart = start + before.length;
			const newEnd = newStart + text.length;
			textarea.setSelectionRange(newStart, newEnd);
		});
	};

	const insertBlock = (prefix: string, suffix = "", defaultText = "") => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const val = textarea.value;
		const selected = val.slice(start, end);
		const text = selected || defaultText;

		const isNewLine = start === 0 || val[start - 1] === "\n";
		const lead = isNewLine ? "" : "\n";
		const replacement = `${lead}${prefix}${text}${suffix}`;
		const nextVal = val.slice(0, start) + replacement + val.slice(end);

		setDraft(nextVal);

		requestAnimationFrame(() => {
			textarea.focus();
			const newStart = start + lead.length + prefix.length;
			const newEnd = newStart + text.length;
			textarea.setSelectionRange(newStart, newEnd);
		});
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Shortcuts
		const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
		const modKey = isMac ? e.metaKey : e.ctrlKey;

		if (modKey && !e.shiftKey && e.key === "b") {
			e.preventDefault();
			wrapSelection("**", "**", "bold text");
			return;
		}

		if (modKey && !e.shiftKey && e.key === "i") {
			e.preventDefault();
			wrapSelection("*", "*", "italic text");
			return;
		}

		if (modKey && !e.shiftKey && e.key === "k") {
			e.preventDefault();
			wrapSelection("[", "](url)", "link text");
			return;
		}

		if (modKey && !e.shiftKey && e.key === "e") {
			e.preventDefault();
			wrapSelection("`", "`", "code");
			return;
		}

		if (modKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
			e.preventDefault();
			insertBlock("```\n", "\n```\n", "code block");
			return;
		}

		// Enter to send
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!draft.trim() || sending || disabled) return;
			void onSend();
		}
	};

	const canSubmit = Boolean(draft.trim()) && !sending && !disabled;

	return (
		<div
			className={cn(
				"group relative rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/90 shadow-sm transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 dark:bg-white/[0.04]",
				disabled && "opacity-50 pointer-events-none",
			)}
		>
			{/* Markdown Formatting Toolbar & View Switcher */}
			<div className="flex items-center justify-between border-b border-stroke-soft-100/70 px-2.5 py-1.5 dark:border-white/[0.06]">
				<div className="flex items-center gap-0.5">
					<button
						type="button"
						onClick={() => wrapSelection("**", "**", "bold text")}
						disabled={mode === "preview" || disabled}
						title="Bold (Cmd+B)"
						aria-label="Bold"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Bold className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("*", "*", "italic text")}
						disabled={mode === "preview" || disabled}
						title="Italic (Cmd+I)"
						aria-label="Italic"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Italic className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("`", "`", "code")}
						disabled={mode === "preview" || disabled}
						title="Inline Code (Cmd+E)"
						aria-label="Inline Code"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Code className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => insertBlock("```\n", "\n```\n", "code block")}
						disabled={mode === "preview" || disabled}
						title="Code Block (Cmd+Shift+C)"
						aria-label="Code Block"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<FileCode className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("[", "](url)", "link text")}
						disabled={mode === "preview" || disabled}
						title="Link (Cmd+K)"
						aria-label="Link"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<LinkIcon className="h-3.5 w-3.5" />
					</button>
					<span className="mx-1 h-3.5 w-px bg-stroke-soft-200 dark:bg-white/10" />
					<button
						type="button"
						onClick={() => insertBlock("- ", "", "list item")}
						disabled={mode === "preview" || disabled}
						title="Bulleted List"
						aria-label="Bulleted List"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<List className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => insertBlock("1. ", "", "list item")}
						disabled={mode === "preview" || disabled}
						title="Numbered List"
						aria-label="Numbered List"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<ListOrdered className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => insertBlock("> ", "", "quote")}
						disabled={mode === "preview" || disabled}
						title="Quote"
						aria-label="Quote"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Quote className="h-3.5 w-3.5" />
					</button>
				</div>

				{/* Write / Preview Tab Switcher */}
				<div className="flex items-center rounded-lg bg-bg-white-0/70 p-0.5 text-[11px] font-medium text-text-sub-600 ring-1 ring-stroke-soft-100 dark:bg-white/[0.06] dark:ring-white/10">
					<button
						type="button"
						onClick={() => {
							setMode("write");
							requestAnimationFrame(() => textareaRef.current?.focus());
						}}
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors",
							mode === "write"
								? "bg-white text-text-strong-950 shadow-xs dark:bg-white/20 dark:text-white"
								: "hover:text-text-strong-950 dark:hover:text-white",
						)}
					>
						<PenLine className="h-3 w-3" />
						Write
					</button>
					<button
						type="button"
						onClick={() => setMode("preview")}
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors",
							mode === "preview"
								? "bg-white text-text-strong-950 shadow-xs dark:bg-white/20 dark:text-white"
								: "hover:text-text-strong-950 dark:hover:text-white",
						)}
					>
						<Eye className="h-3 w-3" />
						Preview
					</button>
				</div>
			</div>

			{/* Main Input Area (Write vs Preview) */}
			<div className="flex items-end gap-2 p-1.5 pl-3">
				{mode === "write" ? (
					<textarea
						ref={textareaRef}
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							e.target.style.height = "auto";
							e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 42), 160)}px`;
						}}
						onKeyDown={handleKeyDown}
						disabled={disabled}
						placeholder={placeholder}
						rows={1}
						className="max-h-[160px] min-h-[42px] flex-1 resize-none overflow-y-auto bg-transparent py-2.5 font-sans text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white"
					/>
				) : (
					<div className="max-h-[160px] min-h-[42px] flex-1 overflow-y-auto py-2.5 pr-2">
						{draft.trim() ? (
							<MarkdownRenderer content={draft} variant="preview" />
						) : (
							<p className="italic text-[13px] text-text-soft-400">
								Nothing to preview yet. Switch to Write and enter markdown text.
							</p>
						)}
					</div>
				)}

				<button
					type="button"
					onClick={() => void onSend()}
					disabled={!canSubmit}
					aria-label="Send reply"
					className={cn(
						"mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
						canSubmit
							? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95"
							: "bg-bg-white-0 text-text-soft-400 ring-1 ring-stroke-soft-100 dark:bg-white/5 dark:ring-white/10",
					)}
				>
					{sending ? (
						<Loader2 className="h-4 w-4 animate-spin text-white" />
					) : (
						<ArrowUp className="h-4 w-4" />
					)}
				</button>
			</div>
		</div>
	);
}
