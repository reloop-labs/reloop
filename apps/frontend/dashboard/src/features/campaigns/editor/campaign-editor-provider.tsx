"use client";

import { BubbleMenu } from "@react-email/editor/ui";
import { generateJSON } from "@tiptap/html";
import { type Editor, EditorContext } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { getRandomColor } from "#/features/templates/editor/collobration/hooks/useCollaboration";
import { EmailSlashCommand } from "#/features/templates/editor/components/canvas/email-slash-command";
import {
	EMAIL_BUBBLE_HIDE_NODES,
	emailTextBubbleTrigger,
} from "#/features/templates/editor/utils/email-slash-command-plugin";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { updateCampaignRequest } from "../campaigns-api";
import { useCampaignQuery } from "../campaigns-provider";
import { useCampaignEditorStore } from "./campaign-editor-store";
import { CampaignEditorHeader } from "./components/campaign-editor-header";
import { useCampaignEditorHook } from "./hooks/use-campaign-editor-hook";
import {
	prepareCampaignHtmlForEditor,
	resolveCampaignEditorDocument,
} from "./hydrate-campaign-editor-content";

interface CampaignEditorProviderProps {
	children: React.ReactNode;
	campaignId: string;
}

const AUTOSAVE_MS = 1500;
const SKIP_HYDRATE_MS = 2500;

export function CampaignEditorProvider({
	children,
	campaignId,
}: CampaignEditorProviderProps) {
	const { user } = useActiveOrganization();
	const campaignQuery = useCampaignQuery(campaignId);
	const campaign = campaignQuery.data;
	const campaignReady =
		Boolean(campaign) &&
		(campaignQuery.isFetched || !campaignQuery.isPlaceholderData);

	const collabUser = {
		name: user?.name || undefined,
		color: getRandomColor(user?.id ?? ""),
		avatar: user?.image ?? undefined,
		email: user?.email ?? undefined,
	};

	const [ydoc] = useState(() => new Y.Doc());
	const editor = useCampaignEditorHook({
		ydoc,
		provider: null,
		user: collabUser,
	});

	const setCampaignData = useCampaignEditorStore((s) => s.setCampaignData);
	const setIsSaving = useCampaignEditorStore((s) => s.setIsSaving);
	const setLastSaved = useCampaignEditorStore((s) => s.setLastSaved);

	const isInitialHydrateRef = useRef(true);
	const hasHydratedEditorRef = useRef(false);
	const skipUntilRef = useRef(Date.now() + SKIP_HYDRATE_MS);
	const inFlightRef = useRef(false);
	const pendingRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveRef = useRef<() => Promise<void>>(async () => {});

	// Populate campaign data into store on initial load
	useEffect(() => {
		if (campaign && isInitialHydrateRef.current) {
			setCampaignData(campaign);
			isInitialHydrateRef.current = false;
		}
	}, [campaign, setCampaignData]);

	// Load the visual document once from the detail payload. Never re-apply
	// after autosave — composed email HTML would re-center blocks.
	useEffect(() => {
		if (!editor || !campaign || !campaignReady || hasHydratedEditorRef.current)
			return;
		if (!editor.isEmpty) {
			hasHydratedEditorRef.current = true;
			return;
		}
		try {
			hydrateCampaignEditor(editor, campaign);
		} catch (err) {
			console.error("Failed to populate initial editor content:", err);
		}
		hasHydratedEditorRef.current = true;
	}, [editor, campaign, campaignReady]);

	// Autosave logic
	saveRef.current = async () => {
		if (!editor || !campaignId || isInitialHydrateRef.current || !campaign)
			return;
		const state = useCampaignEditorStore.getState();
		if (Date.now() < skipUntilRef.current) return;

		if (inFlightRef.current) {
			pendingRef.current = true;
			return;
		}

		inFlightRef.current = true;
		setIsSaving(true);
		try {
			const renderedHtml = await getRenderedEmailHtml(
				editor,
				state.previewText,
			);
			await updateCampaignRequest(campaignId, {
				name: state.name.trim() || "Untitled Campaign",
				subject: state.subject.trim() || undefined,
				previewText: state.previewText.trim() || undefined,
				fromName: state.fromName.trim() || undefined,
				fromEmail:
					state.fromEmail.trim().length >= 3
						? state.fromEmail.trim()
						: undefined,
				replyTo: state.replyTo.trim() || undefined,
				audienceType: state.audienceType,
				audienceTargetId: state.audienceTargetId || undefined,
				audienceTargetName: state.audienceTargetName || undefined,
				content: editor.getJSON().content ?? [],
				contentHtml: renderedHtml,
			});
			setLastSaved(new Date());
		} catch (error) {
			console.error("Failed to auto-save campaign:", error);
		} finally {
			inFlightRef.current = false;
			setIsSaving(false);
			if (pendingRef.current) {
				pendingRef.current = false;
				void saveRef.current();
			}
		}
	};

	const scheduleSave = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			void saveRef.current();
		}, AUTOSAVE_MS);
	}, []);

	// Listen to editor content updates
	useEffect(() => {
		if (!editor) return;
		const onUpdate = () => {
			const store = useCampaignEditorStore.getState();
			if (!store.hasUnsavedChanges) store.setHasUnsavedChanges(true);
			scheduleSave();
		};
		editor.on("update", onUpdate);
		return () => {
			editor.off("update", onUpdate);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [editor, scheduleSave]);

	// Listen to store meta field updates
	const name = useCampaignEditorStore((s) => s.name);
	const subject = useCampaignEditorStore((s) => s.subject);
	const previewText = useCampaignEditorStore((s) => s.previewText);
	const fromName = useCampaignEditorStore((s) => s.fromName);
	const fromEmail = useCampaignEditorStore((s) => s.fromEmail);
	const replyTo = useCampaignEditorStore((s) => s.replyTo);
	const audienceType = useCampaignEditorStore((s) => s.audienceType);
	const audienceTargetId = useCampaignEditorStore((s) => s.audienceTargetId);

	useEffect(() => {
		if (isInitialHydrateRef.current || Date.now() < skipUntilRef.current)
			return;
		scheduleSave();
	}, [
		name,
		subject,
		previewText,
		fromName,
		fromEmail,
		replyTo,
		audienceType,
		audienceTargetId,
		scheduleSave,
	]);

	// Periodic autosave every 15s if there are unsaved changes
	useEffect(() => {
		const interval = setInterval(() => {
			const store = useCampaignEditorStore.getState();
			if (store.hasUnsavedChanges) {
				void saveRef.current();
			}
		}, 15000);
		return () => clearInterval(interval);
	}, []);

	// Flush on page visibility change
	useEffect(() => {
		const flush = () => {
			if (document.visibilityState === "hidden") {
				void saveRef.current();
			}
		};
		document.addEventListener("visibilitychange", flush);
		return () => document.removeEventListener("visibilitychange", flush);
	}, []);

	return (
		<EditorContext.Provider value={{ editor }}>
			<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
				<CampaignEditorHeader />
				<div className="min-h-0 flex-1 overflow-hidden">{children}</div>
				<BubbleMenu
					hideWhenActiveNodes={[...EMAIL_BUBBLE_HIDE_NODES]}
					trigger={emailTextBubbleTrigger}
				/>
				<BubbleMenu.ButtonDefault />
				<BubbleMenu.ImageDefault />
				<EmailSlashCommand />
			</div>
		</EditorContext.Provider>
	);
}

function hydrateCampaignEditor(
	editor: Editor,
	campaign: { content?: unknown; contentHtml?: string | null },
) {
	const document = resolveCampaignEditorDocument(campaign);
	if (!document) return;

	if (document.kind === "json") {
		editor.commands.setContent(
			{ type: "doc", content: document.content },
			{ emitUpdate: false },
		);
		return;
	}

	const html = prepareCampaignHtmlForEditor(document.html);
	try {
		const jsonDoc = generateJSON(
			html,
			editor.extensionManager.extensions as never,
		);
		editor.commands.setContent(jsonDoc, { emitUpdate: false });
	} catch {
		editor.commands.setContent(html, { emitUpdate: false });
	}
}
