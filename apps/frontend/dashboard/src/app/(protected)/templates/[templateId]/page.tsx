"use client";

import type { EmailEditorProps, EmailEditorRef } from "@react-email/editor";
import { EmailEditor } from "@react-email/editor";
import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CenterHeader } from "./components/center-header";
import { useEditorStore } from "./editor/use-editor-store";

// Important: these styles provide the inspector and bubble menu UI for the native editor.
import "@react-email/editor/styles/bubble-menu.css";
import "@react-email/editor/styles/slash-command.css";
import "@react-email/editor/styles/inspector.css";
import "@react-email/editor/themes/default.css";

type TemplateStatus = "draft" | "published" | "archived";

interface TemplateRecord {
	id: string;
	name: string;
	subject: string | null;
	status: TemplateStatus;
	content: unknown[] | null;
	updatedAt?: string;
}

const emptyEditorContent = "<p></p>";

const getInitialEditorContent = (content: TemplateRecord["content"]) => {
	const [savedContent] = content || [];

	if (
		savedContent &&
		typeof savedContent === "object" &&
		"type" in savedContent
	) {
		return savedContent as EmailEditorProps["content"];
	}

	return emptyEditorContent;
};

const TemplateInspector = () => {
	return (
		<Inspector.Root className="template-editor-inspector flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-stroke-soft-200 border-l bg-bg-white-0 text-text-strong-950">
			<div className="flex h-12 shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4">
				<div className="min-w-0">
					<p className="font-medium text-sm text-text-strong-950">Design</p>
					<p className="text-text-soft-400 text-xs">Selection properties</p>
				</div>
			</div>
			<div className="shrink-0 border-stroke-soft-200 border-b px-4 py-3">
				<Inspector.Breadcrumb />
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-4">
				<Inspector.Text />
				<Inspector.Node />
				<Inspector.Document />
			</div>
		</Inspector.Root>
	);
};

const Page = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params.templateId;
	const editorRef = useRef<EmailEditorRef | null>(null);
	const initializeTemplate = useEditorStore((s) => s.initializeTemplate);
	const markDirty = useEditorStore((s) => s.markDirty);
	const markSaved = useEditorStore((s) => s.markSaved);
	const templateName = useEditorStore((s) => s.templateName);
	const setTemplateName = useEditorStore((s) => s.setTemplateName);
	const subject = useEditorStore((s) => s.subject);
	const isDirty = useEditorStore((s) => s.isDirty);
	const status = useEditorStore((s) => s.status);

	const [template, setTemplate] = useState<TemplateRecord | null>(null);
	const [editorContent, setEditorContent] =
		useState<EmailEditorProps["content"]>(emptyEditorContent);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMode, setSaveMode] = useState<TemplateStatus | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const loadTemplate = async () => {
			setIsLoading(true);
			setLoadError(null);

			try {
				const response = await fetch(`/api/template/v1/${templateId}`, {
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to load template");
				}

				const nextTemplate = (await response.json()) as TemplateRecord;

				if (!isActive) return;

				setTemplate(nextTemplate);
				setEditorContent(getInitialEditorContent(nextTemplate.content));
				initializeTemplate(nextTemplate);
			} catch (error) {
				if (!isActive) return;

				const message =
					error instanceof Error ? error.message : "Failed to load template";
				setLoadError(message);
				toast.error(message);
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		};

		loadTemplate();

		return () => {
			isActive = false;
		};
	}, [templateId, initializeTemplate]);

	const handleSave = useCallback(
		async (nextStatus: TemplateStatus) => {
			const trimmedName = templateName.trim();

			if (!trimmedName) {
				toast.error("Template name is required");
				return;
			}

			setIsSaving(true);
			setSaveMode(nextStatus);

			try {
				const json = editorRef.current?.getJSON();
				const response = await fetch(`/api/template/v1/${templateId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						name: trimmedName,
						subject: subject.trim(),
						content: json ? [json] : template?.content || [],
						status: nextStatus,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save template");
				}

				const updatedTemplate = (await response.json()) as TemplateRecord;
				setTemplate(updatedTemplate);
				markSaved(updatedTemplate.status);
				toast.success(
					nextStatus === "published" ? "Template published" : "Template saved",
				);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to save template";
				toast.error(message);
			} finally {
				setIsSaving(false);
				setSaveMode(null);
			}
		},
		[markSaved, subject, template?.content, templateId, templateName],
	);

	return (
		<div className="template-editor-shell flex h-screen flex-col overflow-hidden bg-bg-weak-50 text-text-strong-950">
			{/* Simple top navigation that replaces the complex sidebars */}
			<header className="flex h-14 shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4">
				<div className="flex min-w-0 items-center gap-3">
					<Button.Root asChild mode="ghost" variant="neutral" size="small">
						<Link href="/templates">
							<Button.Icon as={Icon} name="chevron-left" />
							Back
						</Link>
					</Button.Root>
					<div className="h-4 w-[1px] bg-stroke-soft-200" />
					<input
						type="text"
						value={templateName}
						onChange={(event) => setTemplateName(event.target.value)}
						className="min-w-0 max-w-[360px] truncate bg-transparent font-medium text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
						placeholder="Untitled Template"
						aria-label="Template name"
					/>
					<span className="rounded-full border border-stroke-soft-200 px-2 py-0.5 font-medium text-text-sub-600 text-xs capitalize">
						{status}
					</span>
					{isDirty && (
						<span className="text-text-soft-400 text-xs">Unsaved changes</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => handleSave("draft")}
						disabled={isSaving || isLoading}
					>
						{isSaving && saveMode === "draft" && <Spinner size={14} />}
						Save draft
					</Button.Root>
					<Button.Root
						variant="primary"
						size="small"
						onClick={() => handleSave("published")}
						disabled={isSaving || isLoading}
					>
						{isSaving && saveMode === "published" && <Spinner size={14} />}
						Save & Publish
					</Button.Root>
				</div>
			</header>

			<main className="flex flex-1 flex-col overflow-hidden">
				<CenterHeader />
				<div className="flex-1 overflow-auto p-4 sm:p-8">
					<div className="template-editor-surface mx-auto flex h-full min-h-[600px] max-w-6xl overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm">
						{isLoading ? (
							<div className="flex flex-1 items-center justify-center text-text-sub-600">
								<Spinner size={18} />
							</div>
						) : loadError ? (
							<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
								<Icon
									name="alert-circle"
									className="h-8 w-8 text-text-soft-400"
								/>
								<p className="font-medium text-sm text-text-strong-950">
									{loadError}
								</p>
							</div>
						) : (
							<EmailEditor
								key={templateId}
								ref={editorRef}
								placeholder="Press '/' for commands..."
								content={editorContent}
								onReady={(ref) => {
									editorRef.current = ref;
								}}
								onUpdate={(ref) => {
									editorRef.current = ref;
									markDirty();
								}}
								className="template-editor-canvas h-full min-w-0 flex-1 overflow-auto p-8 text-text-strong-950 outline-none focus:outline-none"
							>
								<TemplateInspector />
							</EmailEditor>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default Page;
