"use client";

import * as Button from "@reloop/ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";

const EmailHtmlEditorShell = dynamic(
	() =>
		import("@reloop/web/lib/email-html-editor/editor-shell").then(
			(mod) => mod.EmailHtmlEditorShell,
		),
	{ ssr: false },
);

export function EditorPanel() {
	const [draft, setDraft] = useState("");
	const [initialHtml, setInitialHtml] = useState<string | null>(null);

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
						onClick={() => setInitialHtml(draft.trim())}
						className="rounded-xl"
					>
						Open on canvas
					</Button.Root>
				</div>
			</div>
		</div>
	);
}
