"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { KbdKey } from "@reloop/ui/kbd-key";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const EmailHtmlEditorShell = dynamic(
	() =>
		import("@reloop/web/lib/email-html-editor/editor-shell").then(
			(mod) => mod.EmailHtmlEditorShell,
		),
	{ ssr: false },
);

const actionKbdOnFilledClassName = cn(
	"h-4 w-auto min-w-4 rounded-[5px] px-1 font-mono text-[10px] leading-none",
	"border border-white/20 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.25)]",
	"dark:border-black/15 dark:bg-black/10 dark:text-text-strong-950 dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.15)]",
	"group-disabled:border-stroke-soft-200 group-disabled:bg-transparent group-disabled:text-text-disabled-300 group-disabled:shadow-none",
	"dark:group-disabled:border-white/10 dark:group-disabled:bg-transparent dark:group-disabled:text-white/30",
);

export function EditorPanel() {
	const [draft, setDraft] = useState("");
	const [initialHtml, setInitialHtml] = useState<string | null>(null);
	const [modKey, setModKey] = useState("⌘");
	const lastOpenAtRef = useRef(0);

	useEffect(() => {
		if (
			typeof navigator !== "undefined" &&
			!/Mac|iPhone|iPod|iPad/i.test(navigator.platform)
		) {
			setModKey("Ctrl");
		}
	}, []);

	const handleOpen = useCallback(() => {
		const trimmed = draft.trim();
		if (!trimmed) return;
		const now = Date.now();
		if (now - lastOpenAtRef.current < 400) return;
		lastOpenAtRef.current = now;
		setInitialHtml(trimmed);
	}, [draft]);

	useEffect(() => {
		const handleWindowKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				if (!draft.trim()) return;
				e.preventDefault();
				handleOpen();
			}
		};

		window.addEventListener("keydown", handleWindowKeyDown);
		return () => window.removeEventListener("keydown", handleWindowKeyDown);
	}, [draft, handleOpen]);

	const handleTextareaKeyDown = (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleOpen();
		}
	};

	if (initialHtml) {
		return <EmailHtmlEditorShell initialHtml={initialHtml} />;
	}

	return (
		<div className="mx-auto max-w-4xl">
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#0b0b0b]">
				<div className="border-stroke-soft-200 border-b px-5 py-4 dark:border-white/10">
					<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						Paste React Email or HTML
					</p>
					<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/50">
						Opens on a visual canvas. Inspect styles, then flip to source.
						Nothing is saved or sent.
					</p>
				</div>
				<textarea
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={handleTextareaKeyDown}
					placeholder="<!DOCTYPE html>…"
					spellCheck={false}
					className="min-h-56 w-full resize-y bg-transparent px-5 py-4 font-mono text-[12px] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white/85"
				/>
				<div className="flex items-center justify-end gap-2 border-stroke-soft-200 border-t px-5 py-3 dark:border-white/10">
					<Button.Root
						type="button"
						variant="neutral"
						mode="filled"
						size="small"
						disabled={!draft.trim()}
						onClick={handleOpen}
						className="gap-1.5 rounded-xl"
					>
						<span>Open on canvas</span>
						<span className="inline-flex items-center gap-0.5">
							<KbdKey className={actionKbdOnFilledClassName}>{modKey}</KbdKey>
							<KbdKey className={actionKbdOnFilledClassName}>↵</KbdKey>
						</span>
					</Button.Root>
				</div>
			</div>
		</div>
	);
}
