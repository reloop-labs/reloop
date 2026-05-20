"use client";

import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import {
	CheckCircle2,
	ChevronLeft,
	Clock,
	Eye,
	History,
	Loader2,
	Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PreviewModal } from "./preview-modal"; // Cache bust
import { useEditorStore } from "./use-editor-store";

interface TemplateVersion {
	id: string;
	templateId: string;
	version: number;
	subject: string | null;
	fromEmail: string | null;
	replyTo: string | null;
	previewText: string | null;
	description: string | null;
	name: string | null;
	isMajor: boolean;
	content: unknown[];
	variables: string[];
	renderedHtml: string | null;
	createdByUserId: string;
	createdAt: string;
	createdBy?: {
		id: string;
		name: string;
		email: string;
		image?: string;
	};
}

/* ------------------------------------------------------------------ */
/* Delete Version/Draft Confirmation Modal                           */
/* ------------------------------------------------------------------ */
interface DeleteVersionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	versionLabel: string;
}

function DeleteVersionModal({
	isOpen,
	onClose,
	onConfirm,
	versionLabel,
}: DeleteVersionModalProps) {
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
							<Modal.Title>Delete {versionLabel}</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							Are you sure you want to delete this version? This action cannot
							be undone.
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
							Delete
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

function formatRelativeTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VersionSidebar() {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;
	const { editor } = useCurrentEditor();
	const {
		setSubject,
		setFromEmail,
		setReplyTo,
		setPreviewText,
		lastSavedAt,
		lastSavedDraftNumber,
		subject,
	} = useEditorStore();

	const [isExpanded, setIsExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<"published" | "drafts">("drafts");

	// Modals & Triggers
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [selectedPreviewVersion, setSelectedPreviewVersion] =
		useState<TemplateVersion | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [versionToDelete, setVersionToDelete] = useState<{
		id: string;
		label: string;
	} | null>(null);

	const [restoringId, setRestoringId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const {
		data: versions,
		mutate,
		isLoading,
	} = useSWR<TemplateVersion[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);

	const handleRestore = async (version: TemplateVersion) => {
		if (!editor) return;
		setRestoringId(version.id);

		try {
			editor.commands.setContent({
				type: "doc",
				content: version.content as Record<string, unknown>[],
			});
			setSubject(version.subject || "");
			setFromEmail(version.fromEmail || "");
			setReplyTo(version.replyTo || "");
			setPreviewText(version.previewText || "");

			toast.success(
				`Loaded ${version.name || `v${version.version}`} into editor`,
			);
		} catch (error) {
			console.error("Failed to restore version:", error);
			toast.error("Failed to load version.");
		} finally {
			setTimeout(() => setRestoringId(null), 400);
		}
	};

	const handleDeleteVersion = async (
		versionId: string,
		versionLabel: string,
	) => {
		if (!templateId) return;
		setDeletingId(versionId);

		try {
			const response = await fetch(
				`/api/template/v1/${templateId}/versions/${versionId}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to delete.");
			}

			await mutate();
			toast.success(`Deleted ${versionLabel}`);
		} catch (error: any) {
			console.error("Failed to delete version:", error);
			toast.error(
				error.message || "Cannot delete the active template version.",
			);
		} finally {
			setDeletingId(null);
		}
	};

	// Categorize versions
	const published = versions?.filter((v) => v.isMajor) || [];
	const drafts = versions?.filter((v) => !v.isMajor) || [];
	const currentList = activeTab === "published" ? published : drafts;

	// Build last saved status text
	const getStatusText = () => {
		if (lastSavedAt) {
			const label = lastSavedDraftNumber
				? `Draft ${lastSavedDraftNumber}`
				: "Published";
			return `Last saved: ${label}, ${formatRelativeTime(lastSavedAt.toISOString())}`;
		}
		return "No saves yet";
	};

	// --- Collapsed state: narrow icon strip ---
	if (!isExpanded) {
		return (
			<div className="m-2 flex h-[calc(100vh-79px)] w-12 shrink-0 flex-col items-center gap-1 rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 py-4 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={() => setIsExpanded(true)}
							className="relative size-8 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-neutral-alpha-10 dark:text-zinc-400 dark:hover:bg-zinc-800"
						>
							<Clock size={16} />
							{(published.length > 0 || drafts.length > 0) && (
								<span className="-top-0.5 -right-0.5 absolute flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 font-bold text-[8px] text-white shadow-sm ring-2 ring-white dark:ring-[#0a0a0a]">
									{published.length + drafts.length}
								</span>
							)}
						</Button.Root>
					</Tooltip.Trigger>
					<Tooltip.Content side="right" sideOffset={8}>
						Version history
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		);
	}

	// --- Expanded state: full sidebar ---
	return (
		<div className="slide-in-from-left-2 m-2 flex h-[calc(100vh-79px)] w-72 shrink-0 animate-in flex-col overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 duration-200 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
			{/* Header */}
			<div className="flex h-10 items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-3 dark:bg-[#0a0a0a]">
				<div className="flex items-center gap-1.5 p-0">
					<History size={14} className="text-text-strong-950" strokeWidth={2} />
					<span className="font-semibold text-text-strong-950 text-xs capitalize">
						History
					</span>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={() => setIsExpanded(false)}
					className="size-7 rounded-lg text-text-sub-600 transition-all duration-200 hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
				>
					<ChevronLeft size={24} />
				</Button.Root>
			</div>

			{/* Published / Drafts Tabs */}
			<TabMenuHorizontal.Root
				value={activeTab}
				onValueChange={(val) => setActiveTab(val as "drafts" | "published")}
			>
				<TabMenuHorizontal.List className="flex h-10 w-full gap-0 border-stroke-soft-200 border-b bg-bg-weak-50/10 py-0 dark:border-stroke-soft-100/30">
					<TabMenuHorizontal.Trigger
						value="drafts"
						className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 px-2.5 py-0 font-semibold text-xs outline-none transition-all data-[state=active]:text-text-strong-950 dark:data-[state=active]:text-white"
					>
						<span>Drafts</span>
						<span className="rounded bg-bg-soft-200 px-1.5 py-0.5 font-bold text-[10px] dark:bg-zinc-900 dark:text-zinc-300">
							{drafts.length}
						</span>
					</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger
						value="published"
						className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 px-2.5 py-0 font-semibold text-xs outline-none transition-all data-[state=active]:text-text-strong-950 dark:data-[state=active]:text-white"
					>
						<span>Published</span>
						<span className="rounded bg-bg-soft-200 px-1.5 py-0.5 font-bold text-[10px] dark:bg-zinc-900 dark:text-zinc-300">
							{published.length}
						</span>
					</TabMenuHorizontal.Trigger>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>

			{/* Version List */}
			<div className="hide-scrollbar flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2
							size={18}
							className="animate-spin text-text-disabled-300"
						/>
					</div>
				) : currentList.length === 0 ? (
					<div className="space-y-3 px-4 py-12 text-center">
						<div className="mx-auto flex size-10 items-center justify-center rounded-full bg-bg-soft-200 dark:bg-zinc-900">
							<Clock
								size={18}
								className="text-text-disabled-300 dark:text-zinc-500"
							/>
						</div>
						<div className="space-y-1">
							<p className="font-semibold text-text-strong-950 text-xs dark:text-zinc-200">
								No {activeTab === "published" ? "published versions" : "drafts"}{" "}
								yet
							</p>
							<p className="mx-auto max-w-[180px] text-[11px] text-text-soft-400 leading-normal">
								{activeTab === "published"
									? 'Click "Publish" in the header to create your first published version.'
									: 'Click "Save Draft" in the header to save your current progress.'}
							</p>
						</div>
					</div>
				) : (
					<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/20">
						{currentList.map((version, index) => {
							const isRestoring = restoringId === version.id;
							const isDeleting = deletingId === version.id;

							// Compute display number from position (list is sorted newest-first)
							const displayNumber = currentList.length - index;
							const displayLabel = version.isMajor
								? version.name || `v${displayNumber}`
								: version.name || `Draft ${displayNumber}`;

							return (
								<div
									key={version.id}
									onClick={() => handleRestore(version)}
									className="group relative flex w-full cursor-pointer flex-col border-stroke-soft-100 border-b px-4 py-3.5 transition-all hover:bg-bg-weak-50 dark:border-stroke-soft-100/10 dark:hover:bg-zinc-900/30"
								>
									{/* Top header: Version label & relative time */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5">
											{version.isMajor ? (
												<span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-bold font-mono text-[10px] text-emerald-600 leading-none dark:bg-emerald-950/30 dark:text-emerald-400">
													<CheckCircle2 size={10} />
													{displayLabel}
												</span>
											) : (
												<span className="rounded bg-bg-soft-200 px-2 py-0.5 font-bold font-mono text-[10px] text-text-sub-600 leading-none dark:bg-zinc-800 dark:text-zinc-400">
													{displayLabel}
												</span>
											)}
										</div>
										<span className="font-medium text-[10px] text-text-soft-400 dark:text-zinc-500">
											{formatRelativeTime(version.createdAt)}
										</span>
									</div>

									{/* Description log */}
									{version.description && (
										<p className="mt-1.5 line-clamp-2 text-text-sub-600 text-xs leading-relaxed dark:text-zinc-400">
											{version.description}
										</p>
									)}

									{/* Author avatar & Quick actions strip */}
									<div className="mt-3 flex items-center justify-between">
										{/* Author metadata */}
										<div className="flex items-center gap-1.5">
											<Avatar.Root size="20" color="gray">
												{version.createdBy?.image ? (
													<Avatar.Image
														src={version.createdBy.image}
														alt={version.createdBy.name}
													/>
												) : (
													<span className="font-bold text-[9px] text-text-strong-950 dark:text-zinc-300">
														{version.createdBy?.name?.charAt(0) || "U"}
													</span>
												)}
											</Avatar.Root>
											<span className="max-w-[90px] truncate font-medium text-[10px] text-text-soft-400 dark:text-zinc-400">
												{version.createdBy?.name || "Developer"}
											</span>
										</div>

										{/* Interactive Actions (shown on hover/focus) */}
										<div className="flex items-center gap-1.5 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100">
											{/* Preview action */}
											<Tooltip.Root>
												<Tooltip.Trigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedPreviewVersion(version);
															setIsPreviewOpen(true);
														}}
														className="size-6 rounded p-1 text-text-sub-600 ring-0 transition-colors hover:bg-bg-soft-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
													>
														<Eye size={13} />
													</Button.Root>
												</Tooltip.Trigger>
												<Tooltip.Content side="top">Preview</Tooltip.Content>
											</Tooltip.Root>

											{/* Delete action */}
											<Tooltip.Root>
												<Tooltip.Trigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
														onClick={(e) => {
															e.stopPropagation();
															setVersionToDelete({
																id: version.id,
																label: displayLabel,
															});
															setIsDeleteModalOpen(true);
														}}
														disabled={isDeleting}
														className="size-6 rounded p-1 text-text-sub-600 ring-0 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-rose-950/40"
													>
														{isDeleting ? (
															<Loader2 size={13} className="animate-spin" />
														) : (
															<Trash2 size={13} />
														)}
													</Button.Root>
												</Tooltip.Trigger>
												<Tooltip.Content side="top">Delete</Tooltip.Content>
											</Tooltip.Root>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Bottom status indicator */}
			<div className="flex shrink-0 items-center gap-1.5 border-stroke-soft-100 border-t bg-bg-weak-50 px-4 py-2 font-medium text-[9px] text-text-soft-400 dark:border-stroke-soft-100/10 dark:bg-zinc-900/10">
				<Clock size={10} className="text-text-disabled-300" />
				<span>{getStatusText()}</span>
			</div>

			{isPreviewOpen && selectedPreviewVersion && (
				<PreviewModal
					isOpen={isPreviewOpen}
					onClose={() => {
						setIsPreviewOpen(false);
						setSelectedPreviewVersion(null);
					}}
					version={selectedPreviewVersion}
					currentHtml={editor?.getHTML() || ""}
					currentSubject={subject || ""}
					onRestore={handleRestore}
					isRestoring={restoringId !== null}
				/>
			)}

			<DeleteVersionModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setVersionToDelete(null);
				}}
				onConfirm={() => {
					if (versionToDelete) {
						handleDeleteVersion(versionToDelete.id, versionToDelete.label);
					}
				}}
				versionLabel={versionToDelete?.label || "Version"}
			/>
		</div>
	);
}
