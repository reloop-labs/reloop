"use client";

import type { EmailEditorProps, EmailEditorRef } from "@react-email/editor";
import { EmailEditor } from "@react-email/editor";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "./use-editor-store";
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

const Page = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params.templateId;
	const editorRef = useRef<EmailEditorRef | null>(null);
	const initializeTemplate = useEditorStore((s) => s.initializeTemplate);
	const markDirty = useEditorStore((s) => s.markDirty);

	const [template, setTemplate] = useState<TemplateRecord | null>(null);
	const [editorContent, setEditorContent] =
		useState<EmailEditorProps["content"]>(emptyEditorContent);
	const [isLoading, setIsLoading] = useState(true);
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

	return (
		<div className="mx-auto flex h-full min-h-[600px] max-w-4xl flex-col overflow-hidden rounded-xl bg-bg-white-0">
			{isLoading ? (
				<div className="flex flex-1 items-center justify-center text-text-sub-600">
					<Spinner size={18} />
				</div>
			) : loadError ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
					<Icon name="alert-circle" className="h-8 w-8 text-text-soft-400" />
					<p className="font-medium text-sm text-text-strong-950">
						{loadError}
					</p>
				</div>
			) : (
				<EmailEditor
					key={`${templateId}-${template?.updatedAt || "new"}`}
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
					className="h-full w-full flex-1 pt-4 text-text-strong-950 outline-none focus:outline-none"
				/>
			)}
		</div>
	);
};

export default Page;
