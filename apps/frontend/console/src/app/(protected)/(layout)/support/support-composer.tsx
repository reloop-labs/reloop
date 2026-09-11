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
	Redo2,
	Undo2,
} from "lucide-react";
import {
	type ChangeEvent,
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

interface HistorySnapshot {
	text: string;
	selectionStart: number;
	selectionEnd: number;
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

	// History stack for reliable Undo / Redo (Ctrl+Z, Cmd+Z, Cmd+Shift+Z, Ctrl+Y)
	const historyRef = useRef<HistorySnapshot[]>([
		{ text: draft, selectionStart: 0, selectionEnd: 0 },
	]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const historyIndexRef = useRef(0);
	historyIndexRef.current = historyIndex;
	const lastTypingTimeRef = useRef(0);

	const isMac =
		typeof navigator !== "undefined" &&
		/Mac|iPod|iPhone|iPad/.test(navigator.platform);

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

	// Reset history stack when message is sent (draft cleared)
	useEffect(() => {
		if (draft === "") {
			historyRef.current = [{ text: "", selectionStart: 0, selectionEnd: 0 }];
			setHistoryIndex(0);
		}
	}, [draft]);

	const pushHistory = useCallback(
		(text: string, selectionStart: number, selectionEnd: number) => {
			const currentHistory = historyRef.current.slice(
				0,
				historyIndexRef.current + 1,
			);
			currentHistory.push({ text, selectionStart, selectionEnd });
			if (currentHistory.length > 80) {
				currentHistory.shift();
			}
			historyRef.current = currentHistory;
			setHistoryIndex(currentHistory.length - 1);
		},
		[],
	);

	const undo = useCallback(() => {
		if (historyIndexRef.current > 0) {
			const nextIdx = historyIndexRef.current - 1;
			setHistoryIndex(nextIdx);
			const snapshot = historyRef.current[nextIdx];
			if (snapshot) {
				setDraft(snapshot.text);
				requestAnimationFrame(() => {
					const ta = textareaRef.current;
					if (ta) {
						ta.focus();
						ta.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
					}
				});
			}
		}
	}, [setDraft]);

	const redo = useCallback(() => {
		if (historyIndexRef.current < historyRef.current.length - 1) {
			const nextIdx = historyIndexRef.current + 1;
			setHistoryIndex(nextIdx);
			const snapshot = historyRef.current[nextIdx];
			if (snapshot) {
				setDraft(snapshot.text);
				requestAnimationFrame(() => {
					const ta = textareaRef.current;
					if (ta) {
						ta.focus();
						ta.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
					}
				});
			}
		}
	}, [setDraft]);

	const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const nextVal = e.target.value;
		const start = e.target.selectionStart;
		const end = e.target.selectionEnd;
		const now = Date.now();

		setDraft(nextVal);

		const current = historyRef.current[historyIndexRef.current];
		const prevText = current?.text ?? "";
		const isLargeChange = Math.abs(nextVal.length - prevText.length) > 2;
		const isWordBoundary =
			/\s$/.test(nextVal) || /[\n\.\,\!\?]/.test(nextVal.slice(-1));
		const isPause = now - lastTypingTimeRef.current > 600;

		if (
			isLargeChange ||
			isWordBoundary ||
			isPause ||
			historyRef.current.length <= 1
		) {
			pushHistory(nextVal, start, end);
		} else {
			historyRef.current[historyIndexRef.current] = {
				text: nextVal,
				selectionStart: start,
				selectionEnd: end,
			};
		}
		lastTypingTimeRef.current = now;
	};

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

		const newStart = start + before.length;
		const newEnd = newStart + text.length;

		setDraft(nextVal);
		pushHistory(nextVal, newStart, newEnd);

		requestAnimationFrame(() => {
			textarea.focus();
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

		const newStart = start + lead.length + prefix.length;
		const newEnd = newStart + text.length;

		setDraft(nextVal);
		pushHistory(nextVal, newStart, newEnd);

		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(newStart, newEnd);
		});
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		const modKey = isMac ? e.metaKey : e.ctrlKey;
		const key = e.key.toLowerCase();

		// Undo: Cmd+Z (Mac) / Ctrl+Z (Windows)
		if (modKey && !e.shiftKey && key === "z") {
			e.preventDefault();
			undo();
			return;
		}

		// Redo: Cmd+Shift+Z (Mac) / Ctrl+Y or Ctrl+Shift+Z (Windows)
		if ((modKey && e.shiftKey && key === "z") || (modKey && key === "y")) {
			e.preventDefault();
			redo();
			return;
		}

		// Formatting Shortcuts
		if (modKey && !e.shiftKey && key === "b") {
			e.preventDefault();
			wrapSelection("**", "**", "bold text");
			return;
		}

		if (modKey && !e.shiftKey && key === "i") {
			e.preventDefault();
			wrapSelection("*", "*", "italic text");
			return;
		}

		if (modKey && !e.shiftKey && key === "k") {
			e.preventDefault();
			wrapSelection("[", "](url)", "link text");
			return;
		}

		if (modKey && !e.shiftKey && key === "e") {
			e.preventDefault();
			wrapSelection("`", "`", "code");
			return;
		}

		if (modKey && e.shiftKey && key === "c") {
			e.preventDefault();
			insertBlock("```\n", "\n```\n", "code block");
			return;
		}

		// Enter to send (Shift+Enter for newline)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!draft.trim() || sending || disabled) return;
			void onSend();
		}
	};

	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < historyRef.current.length - 1;
	const canSubmit = Boolean(draft.trim()) && !sending && !disabled;

	return (
		<div
			className={cn(
				"group relative rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/90 shadow-sm transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 dark:bg-white/[0.04]",
				disabled && "pointer-events-none opacity-50",
			)}
		>
			{/* Markdown Formatting Toolbar & View Switcher */}
			<div className="flex items-center justify-between border-stroke-soft-100/70 border-b px-2.5 py-1.5 dark:border-white/[0.06]">
				<div className="flex items-center gap-0.5">
					{/* Undo / Redo Buttons */}
					<button
						type="button"
						onClick={undo}
						disabled={!canUndo || mode === "preview" || disabled}
						title={isMac ? "Undo (Cmd+Z)" : "Undo (Ctrl+Z)"}
						aria-label="Undo"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Undo2 className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={redo}
						disabled={!canRedo || mode === "preview" || disabled}
						title={isMac ? "Redo (Cmd+Shift+Z)" : "Redo (Ctrl+Y)"}
						aria-label="Redo"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Redo2 className="h-3.5 w-3.5" />
					</button>

					<span className="mx-1 h-3.5 w-px bg-stroke-soft-200 dark:bg-white/10" />

					{/* Formatting Buttons */}
					<button
						type="button"
						onClick={() => wrapSelection("**", "**", "bold text")}
						disabled={mode === "preview" || disabled}
						title={isMac ? "Bold (Cmd+B)" : "Bold (Ctrl+B)"}
						aria-label="Bold"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Bold className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("*", "*", "italic text")}
						disabled={mode === "preview" || disabled}
						title={isMac ? "Italic (Cmd+I)" : "Italic (Ctrl+I)"}
						aria-label="Italic"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Italic className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("`", "`", "code")}
						disabled={mode === "preview" || disabled}
						title={isMac ? "Inline Code (Cmd+E)" : "Inline Code (Ctrl+E)"}
						aria-label="Inline Code"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Code className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => insertBlock("```\n", "\n```\n", "code block")}
						disabled={mode === "preview" || disabled}
						title={
							isMac
								? "Code Block (Cmd+Shift+C)"
								: "Code Block (Ctrl+Shift+C)"
						}
						aria-label="Code Block"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<FileCode className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => wrapSelection("[", "](url)", "link text")}
						disabled={mode === "preview" || disabled}
						title={isMac ? "Link (Cmd+K)" : "Link (Ctrl+K)"}
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
				<div className="flex items-center rounded-lg bg-bg-white-0/70 p-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100 dark:bg-white/[0.06] dark:ring-white/10">
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

			{/* Main Input Area: Textarea stays mounted to preserve DOM focus & state */}
			<div className="flex items-end gap-2 p-1.5 pl-3">
				<textarea
					ref={textareaRef}
					value={draft}
					onChange={handleTextChange}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					placeholder={placeholder}
					rows={1}
					className={cn(
						"max-h-[160px] min-h-[42px] flex-1 resize-none overflow-y-auto bg-transparent py-2.5 font-sans text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white",
						mode === "preview" && "hidden",
					)}
				/>

				{mode === "preview" && (
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
