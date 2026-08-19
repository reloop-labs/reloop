import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useCurrentEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { getRenderedEmailHtml } from "#/features/templates/editor/utils/get-rendered-email-html";
import { CollabPresence } from "../../collobration/Collabpresence";
import type { ConnectionStatus as ConnectionStatusType } from "../../collobration/hooks/useCollaboration";
import { DeleteTemplateModal } from "./delete-template-modal";
import { PublishTemplateModal } from "./publish-template-modal";

const viewModes = [
	"visual",
	"ai",
	"code",
	"history",
	"variables",
	"score",
	"test",
] as const;

const isViewMode = (id: string): id is (typeof viewModes)[number] =>
	(viewModes as readonly string[]).includes(id);

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface HeaderActionsProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

const menuItems = [
	{
		id: "visual",
		label: "Design mode",
		icon: "brush" as const,
		isDanger: false,
	},
	{
		id: "ai",
		label: "Template agent",
		icon: "sparkling" as const,
		isDanger: false,
	},
	{
		id: "code",
		label: "Split view / Code",
		icon: "code" as const,
		isDanger: false,
	},
	{
		id: "variables",
		label: "Variables",
		icon: "brackets" as const,
		isDanger: false,
	},
	{
		id: "history",
		label: "Version history",
		icon: "history" as const,
		isDanger: false,
	},
	{
		id: "test",
		label: "Test email",
		icon: "mail" as const,
		isDanger: false,
	},
	{
		id: "score",
		label: "Template score",
		icon: "award" as const,
		isDanger: false,
	},
	{
		id: "duplicate",
		label: "Duplicate",
		icon: "copy" as const,
		isDanger: false,
	},
	{
		id: "delete",
		label: "Delete",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const HeaderActions = ({
	connectionStatus,
	isSynced,
}: HeaderActionsProps) => {
	const templateId = useTemplateId();
	const router = useRouter();
	const { editor } = useCurrentEditor();
	const {
		isSavingDraft,
		isPublishing,
		setIsSavingDraft,
		setIsPublishing,
		setLastSaved,
		setHasUnsavedChanges,
		setLastAiPrompt,
		subject,
		fromEmail,
		replyTo,
		previewText,
	} = useEditorStore();

	const [, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	// Dialog States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	// SWR hook to fetch versions cache for Diff comparison
	const { data: versions, mutate } = useSWR<any[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);
	const latestPublished = versions?.find((v) => v.isMajor) ?? null;

	const handleSaveDraft = async () => {
		if (!editor || !templateId || isSavingDraft) return;
		setIsSavingDraft(true);

		try {
			const content = editor.getJSON().content ?? [];
			const renderedHtml = await getRenderedEmailHtml(editor, previewText);

			// 1. Create the version snapshot
			const response = await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content,
					renderedHtml,
					isMajor: false,
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
				console.warn("[draft] Failed to sync template baseline:", err),
			);

			const result = await response.json();
			const draftNum = result.draftNumber ?? null;
			setLastSaved(draftNum, new Date());
			setHasUnsavedChanges(false);
			setLastAiPrompt("");
			toast.success(draftNum ? `Saved as Draft ${draftNum}` : "Draft saved", {
				duration: 2000,
			});
			mutate();
		} catch (error) {
			console.error("Failed to save draft:", error);
			toast.error("Failed to save draft.");
		} finally {
			setIsSavingDraft(false);
		}
	};

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
			await fetch(`/api/template/v1/${templateId}`, {
				method: "DELETE",
				credentials: "include",
			});
			router.push("/templates");
		} catch (error) {
			console.error("Failed to delete template:", error);
			toast.error("Failed to delete template.");
		}
	};

	const handleDuplicate = async () => {
		if (!templateId) return;

		try {
			const response = await fetch(`/api/template/v1/${templateId}/duplicate`, {
				method: "POST",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to duplicate template");
			}

			const newTemplate = await response.json();
			toast.success("Template duplicated successfully");
			router.push(`/templates/${newTemplate.id}`);
		} catch (error) {
			console.error("Failed to duplicate template:", error);
			toast.error("Failed to duplicate template");
		}
	};

	const handleItemClick = (itemId: string) => {
		setPopoverOpen(false);
		if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		} else if (itemId === "duplicate") {
			handleDuplicate();
		} else if (isViewMode(itemId)) {
			setViewMode(itemId);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<CollabPresence status={connectionStatus} isSynced={isSynced} />
			<Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
				<Popover.Trigger asChild>
					<Button.Root variant="neutral" mode="stroke" size="xsmall">
						<Icon
							name="more-horizontal"
							className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
						/>
					</Button.Root>
				</Popover.Trigger>
				<Popover.Content
					align="end"
					sideOffset={-8}
					className="w-48 rounded-xl p-1.5"
					showArrow
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<div key={item.id}>
								<button
									ref={(el) => {
										if (el) buttonRefs.current[idx] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleItemClick(item.id)}
									className={cn(
										"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
										item.isDanger ? "text-error-base" : "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
									)}
								>
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
									<span>{item.label}</span>
								</button>
							</div>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Popover.Content>
			</Popover.Root>

			{/* Save Draft Button */}
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="xsmall"
				onClick={handleSaveDraft}
				disabled={isSavingDraft}
				className="gap-1.5"
			>
				<Icon name="file-text" className="h-3.5 w-3.5 text-text-sub-600" />
				{isSavingDraft ? "Saving..." : "Save Draft"}
			</Button.Root>

			{/* Publish Button */}
			<FancyButton.Root
				variant="neutral"
				size="xsmall"
				onClick={() => setIsPublishModalOpen(true)}
				disabled={isPublishing}
			>
				{isPublishing ? "Publishing..." : "Publish"}
			</FancyButton.Root>

			{/* Delete Confirmation Modal */}
			<DeleteTemplateModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDelete}
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
