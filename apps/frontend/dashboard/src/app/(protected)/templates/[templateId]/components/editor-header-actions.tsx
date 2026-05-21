"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import * as Popover from "@reloop/ui/popover";
import * as Textarea from "@reloop/ui/textarea";
import { useCurrentEditor } from "@tiptap/react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { CollabPresence } from "./collobration/Collabpresence";
import type { ConnectionStatus as ConnectionStatusType } from "./collobration/hooks/useCollaboration";
import { DiffViewer } from "./diff-viewer"; // Cache bust
import { useEditorStore } from "./use-editor-store";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

interface EditorHeaderActionsProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

const menuItems = [
	{
		id: "test",
		label: "Test email",
		icon: "mail" as const,
		isDanger: false,
	},
	{
		id: "history",
		label: "Version history",
		icon: "history" as const,
		isDanger: false,
	},
	{
		id: "details",
		label: "View details",
		icon: "info-outline" as const,
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

/* ------------------------------------------------------------------ */
/* Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */
interface DeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[400px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="trash" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Delete Template</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							Are you sure you want to delete this template? This action cannot
							be undone and will delete all associated versions and drafts.
						</p>
					</Modal.Body>
					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClose}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="button"
							variant="error"
							mode="filled"
							size="xsmall"
							onClick={() => {
								onConfirm();
								onClose();
							}}
						>
							Delete Template
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}

/* ------------------------------------------------------------------ */
/* Publish Confirmation Modal with Visual Diffing                     */
/* ------------------------------------------------------------------ */
interface PublishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (description: string) => Promise<void>;
	isPublishing: boolean;
	latestPublished: any;
	currentHtml: string;
	currentSubject: string;
}

function PublishModal({
	isOpen,
	onClose,
	onConfirm,
	isPublishing,
	latestPublished,
	currentHtml,
	currentSubject,
}: PublishModalProps) {
	const [description, setDescription] = useState("");
	const [showDiff, setShowDiff] = useState(false);

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className={cn(
					"rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans transition-all duration-300",
					showDiff ? "h-[85vh] max-w-[80vw]" : "sm:max-w-[480px]",
				)}
				showClose={true}
			>
				<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="info-outline" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Publish Template Version</Modal.Title>
						</div>
					</Modal.Header>

					<Modal.Body className="flex-1 space-y-4 overflow-y-auto">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							This will create a new major production version and set it as the
							active version for transactional sends.
						</p>

						<div className="space-y-1.5">
							<span className="mb-1.5 block font-semibold text-text-strong-950 text-xs">
								Release Description / Changelog
							</span>
							<Textarea.Root
								simple
								placeholder="Describe what changed in this version (e.g. fixed layout issues, added welcome banner)..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="h-24 text-xs"
							/>
						</div>

						{/* Collapsible Visual Diff */}
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-stroke-soft-100/40">
							<button
								type="button"
								onClick={() => setShowDiff((prev) => !prev)}
								className="flex w-full items-center justify-between bg-bg-weak-50 px-4 py-2.5 transition-colors hover:bg-neutral-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-800"
							>
								<div className="flex items-center gap-2">
									<Icon
										name="refresh-cw"
										className="size-4 text-text-sub-600"
									/>
									<span className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
										Review changes before publishing
									</span>
								</div>
								{showDiff ? (
									<ChevronUp className="size-4 text-text-sub-600" />
								) : (
									<ChevronDown className="size-4 text-text-sub-600" />
								)}
							</button>

							{showDiff && (
								<div className="h-[48vh] border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
									<DiffViewer
										oldHtml={latestPublished?.renderedHtml || ""}
										newHtml={currentHtml}
										oldSubject={latestPublished?.subject || ""}
										newSubject={currentSubject}
										viewportWidth="100%"
									/>
								</div>
							)}
						</div>
					</Modal.Body>

					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClose}
							disabled={isPublishing}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="button"
							variant="primary"
							size="xsmall"
							onClick={() => onConfirm(description)}
							disabled={isPublishing}
						>
							{isPublishing ? "Publishing..." : "Confirm & Publish"}
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}

export const EditorHeaderActions = ({
	connectionStatus,
	isSynced,
}: EditorHeaderActionsProps) => {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;
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
			const renderedHtml = editor.getHTML();

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
			mutate(); // Refresh the sidebar list
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
			const renderedHtml = editor.getHTML();

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
			// (The backend also updates status to "published" via createVersion,
			//  but we also need to persist the content and subject on the template record)
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
			mutate(); // Refresh version lists in sidebar and dialog
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
				<Save size={14} className="text-text-sub-600" />
				{isSavingDraft ? "Saving..." : "Save Draft"}
			</Button.Root>

			{/* Publish Button */}
			<Button.Root
				variant="primary"
				size="xsmall"
				onClick={() => setIsPublishModalOpen(true)}
				disabled={isPublishing}
			>
				{isPublishing ? "Publishing..." : "Publish"}
			</Button.Root>

			{/* Delete Confirmation Modal */}
			<DeleteModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDelete}
			/>

			{/* Publish Confirmation Modal */}
			<PublishModal
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
