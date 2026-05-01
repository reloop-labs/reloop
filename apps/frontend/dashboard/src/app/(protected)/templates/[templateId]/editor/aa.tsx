"use client";

import { EmailEditor, type EmailEditorRef } from "@react-email/editor";
import { useRef, useState } from "react";

const content = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 1 },
			content: [{ type: "text", text: "Welcome to the Newsletter" }],
		},
		{
			type: "paragraph",
			content: [
				{
					type: "text",
					text: "Edit this content, then use the buttons below to export or inspect the editor output. Try switching themes to see how the editor adapts.",
				},
			],
		},
	],
};

export function StandaloneEditorFull() {
	const editorRef = useRef<EmailEditorRef>(null);
	const [theme, setTheme] = useState<"basic" | "minimal">("basic");
	const [output, setOutput] = useState("");

	const handleExportHtml = async () => {
		if (!editorRef.current) return;
		const html = await editorRef.current.getEmailHTML();
		setOutput(html);
	};

	const handleGetJson = () => {
		if (!editorRef.current) return;
		setOutput(JSON.stringify(editorRef.current.getJSON(), null, 2));
	};

	return (
		<>
			<div className="mb-4 flex gap-2">
				<button
					type="button"
					onClick={() => setTheme(theme === "basic" ? "minimal" : "basic")}
					className="cursor-pointer rounded-lg border border-(--re-border) bg-(--re-bg) px-3 py-1.5 text-(--re-text) text-[0.8125rem] hover:bg-(--re-hover)"
				>
					Theme: {theme}
				</button>
				<button
					type="button"
					onClick={handleExportHtml}
					className="cursor-pointer rounded-lg border border-(--re-border) bg-(--re-bg) px-3 py-1.5 text-(--re-text) text-[0.8125rem] hover:bg-(--re-hover)"
				>
					Export HTML
				</button>
				<button
					type="button"
					onClick={handleGetJson}
					className="cursor-pointer rounded-lg border border-(--re-border) bg-(--re-bg) px-3 py-1.5 text-(--re-text) text-[0.8125rem] hover:bg-(--re-hover)"
				>
					Get JSON
				</button>
			</div>

			<EmailEditor
				className="rounded-md bg-white p-4"
				ref={editorRef}
				content={content}
				theme={theme}
			/>

			{output && (
				<textarea
					readOnly
					value={output}
					className="mt-4 h-64 w-full resize-y rounded-lg border border-(--re-border) bg-(--re-bg) p-3 font-mono text-(--re-text) text-xs"
				/>
			)}
		</>
	);
}
