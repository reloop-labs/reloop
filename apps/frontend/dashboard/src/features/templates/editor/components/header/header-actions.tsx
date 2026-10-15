import * as FancyButton from "@reloop/ui/fancy-button";
import { useCurrentEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteTemplateModal } from "#/features/templates/components/delete-template-modal";
import { useAutoSaveDraft } from "#/features/templates/editor/hooks/use-auto-save-draft";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import {
	getLockedSourceHtml,
	getRenderedEmailHtml,
} from "#/features/templates/editor/utils/get-rendered-email-html";
import { CollabPresence } from "../../collobration/Collabpresence";
import type { ConnectionStatus as ConnectionStatusType } from "../../collobration/hooks/useCollaboration";
import { TestEmailModal } from "../panels/test/test-email-modal";
import { DiscardDraftModal } from "./discard-draft-modal";
import { PublishTemplateModal } from "./publish-template-modal";

const fetcher = async (url: string) => {
	const res = await fetch(url, { credentials: "include" });
	if (!res.ok) {
		throw new Error(`Failed to fetch: ${res.statusText}`);
	}
	return res.json();
};

interface HeaderActionsProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

export const HeaderActions = ({
	connectionStatus,
	isSynced,
}: HeaderActionsProps) => {
	const templateId = useTemplateId();
	const router = useRouter();
	const { editor } = useCurrentEditor();
	const {
		isPublishing,
		setIsPublishing,
		setLastSaved,
		setHasUnsavedChanges,
		subject,
		fromEmail,
		replyTo,
		previewText,
		setSubject,
		setFromEmail,
		setReplyTo,
		setPreviewText,
	} = useEditorStore();
	useAutoSaveDraft();

	// Dialog States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [isTestModalOpen, setIsTestModalOpen] = useState(false);
	const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

	// SWR hook to fetch versions cache for Diff comparison
	const { data: versions, mutate } = useSWR<any[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);
	const { data: template } = useSWR<{ name?: string }>(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);
	const latestPublished = Array.isArray(versions)
		? (versions.find((v) => v.isMajor) ?? null)
		: null;

	// Serialized editor body, kept in sync so we can diff it against the published snapshot.
	const [editorContentKey, setEditorContentKey] = useState("");
	useEffect(() => {
		if (!editor) return;
		const sync = () =>
			setEditorContentKey(JSON.stringify(editor.getJSON().content ?? []));
		sync();
		editor.on("update", sync);
		return () => {
			editor.off("update", sync);
		};
	}, [editor]);

	// Run the snapshot through the editor schema so it serializes exactly like getJSON().
	const publishedContentKey = useMemo(() => {
		if (!editor || !latestPublished) return null;
		const content = latestPublished.content ?? [];
		try {
			return JSON.stringify(
				editor.schema.nodeFromJSON({ type: "doc", content }).toJSON().content ??
					[],
			);
		} catch {
			return JSON.stringify(content);
		}
	}, [editor, latestPublished]);

	// What the editor serialized to right after a discard: that state is "clean"
	// even if collaboration normalized it differently from the snapshot.
	const [discardBaseline, setDiscardBaseline] = useState<{
		versionId: string;
		key: string;
	} | null>(null);
	const isAtDiscardBaseline =
		!!discardBaseline &&
		discardBaseline.versionId === latestPublished?.id &&
		discardBaseline.key === editorContentKey;

	const hasDraftChanges =
		!!latestPublished &&
		!!editorContentKey &&
		((editorContentKey !== publishedContentKey && !isAtDiscardBaseline) ||
			(subject || "") !== (latestPublished.subject || "") ||
			(fromEmail || "") !== (latestPublished.fromEmail || "") ||
			(replyTo || "") !== (latestPublished.replyTo || "") ||
			(previewText || "") !== (latestPublished.previewText || ""));

	const handleDiscardDraft = async () => {
		if (!editor || !templateId || !latestPublished) return;
		const published = {
			content: (latestPublished.content ?? []) as Record<string, unknown>[],
			subject: latestPublished.subject || "",
			fromEmail: latestPublished.fromEmail || "",
			replyTo: latestPublished.replyTo || "",
			previewText: latestPublished.previewText || "",
		};
		try {
			// Editor content is collaborative (Yjs), so this reverts it for every open session.
			editor.commands.setContent({ type: "doc", content: published.content });
			const resetKey = JSON.stringify(editor.getJSON().content ?? []);
			setEditorContentKey(resetKey);
			setDiscardBaseline({ versionId: latestPublished.id, key: resetKey });
			// Collaboration can apply one more normalizing update after setContent.
			setTimeout(() => {
				setDiscardBaseline({
					versionId: latestPublished.id,
					key: JSON.stringify(editor.getJSON().content ?? []),
				});
			}, 100);
			setSubject(published.subject);
			setFromEmail(published.fromEmail);
			setReplyTo(published.replyTo);
			setPreviewText(published.previewText);

			// Persist right away instead of waiting on the autosave debounce.
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(published),
			});
			if (!res.ok) throw new Error(`Discard failed (${res.status})`);
			setLastSaved(null, new Date());
			setHasUnsavedChanges(false);
			toast.success("Draft changes discarded");
		} catch (error) {
			console.error("Failed to discard draft changes:", error);
			toast.error("Failed to discard draft changes.");
			throw error;
		}
	};

	const handlePublish = async (description?: string) => {
		if (!editor || !templateId || isPublishing) return;
		setIsPublishing(true);

		try {
			const content = editor.getJSON().content ?? [];
			const renderedHtml =
				getLockedSourceHtml() ??
				(await getRenderedEmailHtml(editor, previewText));

			// 1. Create the published version snapshot
			const response = await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content,
					renderedHtml,
					isMajor: true,
					description,
					subject,
					fromEmail,
					replyTo,
					previewText,
				}),
				credentials: "include",
			});

			// 2. Sync the template baseline so reopening always finds latest content
			fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content,
					subject,
					fromEmail,
					replyTo,
					previewText,
				}),
				credentials: "include",
			}).catch((err) =>
				console.warn("[publish] Failed to sync template baseline:", err),
			);

			const result = await response.json();
			const pubNum = result.publishNumber ?? null;
			setLastSaved(null, new Date());
			setHasUnsavedChanges(false);
			mutate();
		} catch (error) {
			console.error("Failed to publish template:", error);
			toast.error("Failed to publish template.");
			throw error;
		} finally {
			setIsPublishing(false);
		}
	};

	const handleDelete = async () => {
		if (!templateId) return;

		try {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) throw new Error("delete failed");
		} catch (error) {
			console.error("Failed to delete template:", error);
			toast.error("Failed to delete template.");
			throw error;
		}
	};
	return (
		<div className="flex items-center gap-2">
			<CollabPresence status={connectionStatus} isSynced={isSynced} />
			{hasDraftChanges && (
				<FancyButton.Root
					variant="basic"
					size="xsmall"
					onClick={() => setIsDiscardModalOpen(true)}
					disabled={isPublishing}
				>
					Discard changes
				</FancyButton.Root>
			)}
			{/* Test Button */}
			<FancyButton.Root
				variant="basic"
				size="xsmall"
				onClick={() => setIsTestModalOpen(true)}
			>
				Test email
			</FancyButton.Root>

			{/* Publish Button */}
			<FancyButton.Root
				variant="neutral"
				size="xsmall"
				onClick={() => setIsPublishModalOpen(true)}
				disabled={isPublishing}
			>
				{isPublishing ? "Publishing..." : "Publish"}
			</FancyButton.Root>

			<TestEmailModal
				isOpen={isTestModalOpen}
				onClose={() => setIsTestModalOpen(false)}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteTemplateModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDelete}
				templateName={template?.name || "Untitled"}
				onDeleted={() => router.push("/templates")}
			/>

			<DiscardDraftModal
				isOpen={isDiscardModalOpen}
				onClose={() => setIsDiscardModalOpen(false)}
				onConfirm={handleDiscardDraft}
				publishedLabel={
					latestPublished?.name ||
					(latestPublished?.version ? `v${latestPublished.version}` : "latest")
				}
			/>

			{/* Publish Confirmation Modal */}
			<PublishTemplateModal
				isOpen={isPublishModalOpen}
				onClose={() => setIsPublishModalOpen(false)}
				onConfirm={handlePublish}
				isPublishing={isPublishing}
				latestPublished={latestPublished}
				currentHtml={editor?.getHTML() || ""}
				currentSubject={subject || ""}
			/>
		</div>
	);
};
