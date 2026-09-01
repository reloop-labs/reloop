import * as FancyButton from "@reloop/ui/fancy-button";
import { useCurrentEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteTemplateModal } from "#/features/templates/components/delete-template-modal";
import { useAutoSaveDraft } from "#/features/templates/editor/hooks/use-auto-save-draft";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { CollabPresence } from "../../collobration/Collabpresence";
import type { ConnectionStatus as ConnectionStatusType } from "../../collobration/hooks/useCollaboration";
import { TestEmailModal } from "../panels/test/test-email-modal";
import { PublishTemplateModal } from "./publish-template-modal";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

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
	} = useEditorStore();
	useAutoSaveDraft();

	// Dialog States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [isTestModalOpen, setIsTestModalOpen] = useState(false);

	// SWR hook to fetch versions cache for Diff comparison
	const { data: versions, mutate } = useSWR<any[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);
	const { data: template } = useSWR<{ name?: string }>(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);
	const latestPublished = versions?.find((v) => v.isMajor) ?? null;

	const handlePublish = async (description?: string) => {
		if (!editor || !templateId || isPublishing) return;
		setIsPublishing(true);

		try {
			const content = editor.getJSON().content ?? [];
			const renderedHtml = await getRenderedEmailHtml(editor, previewText);

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
			toast.success(
				pubNum ? `Published as v${pubNum}` : "Template published!",
				{ duration: 3000 },
			);
			setIsPublishModalOpen(false);
			mutate();
		} catch (error) {
			console.error("Failed to publish template:", error);
			toast.error("Failed to publish template.");
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
			{/* Test Button */}
			<FancyButton.Root
				variant="basic"
				size="xsmall"
				onClick={() => setIsTestModalOpen(true)}
			>
				Test
			</FancyButton.Root>

			{/* Publish Button */}
			<FancyButton.Root
				variant="blue"
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
