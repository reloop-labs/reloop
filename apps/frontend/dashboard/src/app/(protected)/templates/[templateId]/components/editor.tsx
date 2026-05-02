"use client";

import { composeReactEmail } from "@react-email/editor/core";
import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import {
	BubbleMenu,
	defaultSlashCommands,
	Inspector,
	SlashCommand,
} from "@react-email/editor/ui";
import {
	EditorContent,
	EditorContext,
	useCurrentEditor,
	useEditor,
} from "@tiptap/react";
import { useState } from "react";
import "@react-email/editor/themes/default.css";

type EditorTheme = "basic" | "minimal";

const content = `
  <h1>Weekly Newsletter</h1>
  <p>This is a full-featured email editor combining all available components. Try selecting text, inserting columns, adding buttons, and switching themes.</p>
  <h2>Featured Article</h2>
  <p>Check out our latest post on <a href="https://react.email" target="_blank">React Email</a> for building better email templates.</p>
  <a class="button" data-id="react-email-button" href="https://react.email">Read More</a>
`;

function ExportPanel() {
	const { editor } = useCurrentEditor();
	const [html, setHtml] = useState("");
	const [exporting, setExporting] = useState(false);

	const handleExport = async () => {
		if (!editor) return;
		setExporting(true);
		try {
			const result = await composeReactEmail({ editor });
			setHtml(result.html);
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className="mt-4">
			<button
				type="button"
				onClick={handleExport}
				disabled={exporting}
				className="cursor-pointer rounded-lg border border-(--re-border) bg-(--re-bg) px-3 py-1.5 text-(--re-text) text-[0.8125rem] hover:bg-(--re-hover) disabled:opacity-50"
			>
				{exporting ? "Exporting..." : "Export HTML"}
			</button>
			{html && (
				<textarea
					readOnly
					value={html}
					className="mt-3 h-64 w-full resize-y rounded-lg border border-(--re-border) bg-(--re-bg) p-3 font-mono text-(--re-text) text-xs"
				/>
			)}
		</div>
	);
}

export function FullEmailBuilder() {
	const [theme, setTheme] = useState<EditorTheme>("basic");
	const extensions = [StarterKit, EmailTheming.configure({ theme })];
	const editor = useEditor(
		{
			extensions,
			content,
			immediatelyRender: false,
		},
		[theme],
	);

	if (!editor) return null;

	return (
		<div>
			<div className="mb-4 flex gap-2">
				<button
					type="button"
					onClick={() => setTheme("basic")}
					className={`cursor-pointer rounded-lg border border-(--re-border) px-3 py-1.5 text-[0.8125rem] ${
						theme === "basic"
							? "bg-(--re-text) font-medium text-(--re-bg)"
							: "bg-(--re-bg) text-(--re-text) hover:bg-(--re-hover)"
					}`}
				>
					Basic Theme
				</button>
				<button
					type="button"
					onClick={() => setTheme("minimal")}
					className={`cursor-pointer rounded-lg border border-(--re-border) px-3 py-1.5 text-[0.8125rem] ${
						theme === "minimal"
							? "bg-(--re-text) font-medium text-(--re-bg)"
							: "bg-(--re-bg) text-(--re-text) hover:bg-(--re-hover)"
					}`}
				>
					Minimal Theme
				</button>
			</div>
			<EditorContext.Provider value={{ editor }}>
				<div
					className="-mx-4 -mb-4 flex overflow-hidden border-(--re-border) border-t"
					style={{ height: "32rem" }}
				>
					<div className="m-4 mt-0 min-w-0 flex-1 overflow-y-auto">
						<EditorContent
							className="rounded-md bg-white p-4 pt-0"
							editor={editor}
						/>

						<BubbleMenu
							hideWhenActiveNodes={["button"]}
							hideWhenActiveMarks={["link"]}
						/>
						<BubbleMenu.LinkDefault />
						<BubbleMenu.ButtonDefault />
						<SlashCommand items={defaultSlashCommands} />
						<ExportPanel />
					</div>
					<aside className="flex w-56 shrink-0 flex-col gap-3 overflow-y-auto border-(--re-border) border-l p-3 text-xs">
						<Inspector.Root>
							<nav>
								<ol className="m-0 mb-4 flex list-none items-center gap-1 p-0">
									<Inspector.Breadcrumb>
										{(segments) =>
											segments.map((segment, i) => {
												const label = segment.node?.nodeType ?? "Layout";
												if (i === segments.length - 1) {
													return (
														<li key={i} className="flex items-center gap-1">
															{i !== 0 && (
																<span className="text-(--re-text-muted)">
																	/
																</span>
															)}
															<span className="p-0 text-(--re-text) text-xs capitalize">
																{label}
															</span>
														</li>
													);
												}
												return (
													<li key={i} className="flex items-center gap-1">
														{i !== 0 && (
															<span className="text-(--re-text-muted)">/</span>
														)}
														<button
															type="button"
															className="cursor-pointer border-0 bg-transparent p-0 text-(--re-text-muted) text-xs capitalize hover:text-(--re-text)"
															onClick={() => segment.focus()}
														>
															{label}
														</button>
													</li>
												);
											})
										}
									</Inspector.Breadcrumb>
								</ol>
							</nav>
							<Inspector.Document />
						</Inspector.Root>
					</aside>
				</div>
			</EditorContext.Provider>
		</div>
	);
}
