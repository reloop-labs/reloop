import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { PreviewModal } from "../../preview/preview-modal";

const viewModes = [
	"visual",
	"ai",
	"code",
	"history",
	"variables",
	"score",
	"test",
] as const;

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

/* ------------------------------------------------------------------ */
/* Publish Version/Draft Confirmation Modal                          */
/* ------------------------------------------------------------------ */
interface PublishVersionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (description: string) => Promise<void>;
	isPublishing: boolean;
	versionLabel: string;
	isAlreadyPublished: boolean;
}

function PublishVersionModal({
	isOpen,
	onClose,
	onConfirm,
	isPublishing,
	versionLabel,
	isAlreadyPublished,
}: PublishVersionModalProps) {
	const [description, setDescription] = useState("");

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[400px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="info-outline" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Publish {versionLabel}</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-3">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							{isAlreadyPublished
								? "This will make this previously published version the active version for transactional sends."
								: "This will create a new major production version based on the content of this draft, making it the active version for sends."}
						</p>
						{!isAlreadyPublished && (
							<div className="space-y-1.5 pt-2">
								<span className="block font-semibold text-text-strong-950 text-xs">
									Release Description / Changelog (Optional)
								</span>
								<textarea
									placeholder="Describe what changed in this version..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="h-20 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 text-paragraph-xs text-text-strong-950 outline-none focus:border-stroke-soft-200 dark:border-stroke-soft-100/40"
								/>
							</div>
						)}
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
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={() => onConfirm(description)}
							disabled={isPublishing}
						>
							{isPublishing ? "Publishing..." : "Confirm & Publish"}
						</FancyButton.Root>
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
	if (minutes < 60) {
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	if (hours < 24) {
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (days === 1) {
		return "Yesterday";
	}
	if (days < 7) {
		return `${days} days ago`;
	}

	const day = date.getDate();
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const year = date.getFullYear();
	const currentYear = now.getFullYear();

	if (year === currentYear) {
		return `${day} ${month}`;
	}
	return `${day} ${month}, ${year}`;
}

export function VersionSidebar() {
	const templateId = useTemplateId();
	const { editor } = useCurrentEditor();
	const {
		setSubject,
		setFromEmail,
		setReplyTo,
		setPreviewText,
		subject,
		lastSavedAt,
		lastSavedDraftNumber,
	} = useEditorStore();

	const [, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	// Modals & Triggers
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [selectedPreviewVersion, setSelectedPreviewVersion] =
		useState<TemplateVersion | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [versionToDelete, setVersionToDelete] = useState<{
		id: string;
		label: string;
	} | null>(null);

	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [versionToPublish, setVersionToPublish] =
		useState<TemplateVersion | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);

	const [restoringId, setRestoringId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<HTMLDivElement[]>([]);
	const currentItem = itemRefs.current[hoverIdx ?? -1];
	const currentRect = currentItem?.getBoundingClientRect();

	const {
		data: versions,
		mutate,
		isLoading,
	} = useSWR<TemplateVersion[]>(
		templateId ? `/api/template/v1/${templateId}/versions` : null,
		fetcher,
	);

	const { data: template, mutate: mutateTemplate } = useSWR<any>(
		templateId ? `/api/template/v1/${templateId}` : null,
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
		} catch (error) {
			console.error("Failed to delete version:", error);
			const err = error as Error;
			toast.error(err.message || "Cannot delete the active template version.");
		} finally {
			setDeletingId(null);
		}
	};

	const handlePublishVersion = async (description: string) => {
		if (!versionToPublish || !templateId || isPublishing) return;
		setIsPublishing(true);

		try {
			if (versionToPublish.isMajor) {
				// 1. If it was already published (isMajor === true), make it the active version without creating a new record
				const restoreResponse = await fetch(
					`/api/template/v1/${templateId}/versions/${versionToPublish.id}/restore`,
					{
						method: "POST",
						credentials: "include",
					},
				);

				if (!restoreResponse.ok) {
					const errData = await restoreResponse.json().catch(() => ({}));
					throw new Error(errData.message || "Failed to make version active.");
				}

				// 2. Set status to published
				await fetch(`/api/template/v1/${templateId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						status: "published",
					}),
					credentials: "include",
				}).catch((err) =>
					console.warn("[republish] Failed to set template status:", err),
				);

				// 3. Update editor content to match the republished version
				if (editor) {
					editor.commands.setContent({
						type: "doc",
						content: versionToPublish.content as Record<string, unknown>[],
					});
					setSubject(versionToPublish.subject || "");
					setFromEmail(versionToPublish.fromEmail || "");
					setReplyTo(versionToPublish.replyTo || "");
					setPreviewText(versionToPublish.previewText || "");
				}

				const pubNum = getMajorVersionNumber(versionToPublish.id);
				toast.success(
					pubNum
						? `v${pubNum}.0 set as the active published version!`
						: "Version published successfully!",
				);

				setIsPublishModalOpen(false);
				setVersionToPublish(null);
				mutate();
				mutateTemplate();
				return;
			}

			// 1. Create the published version snapshot (for drafts)
			const response = await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: versionToPublish.content,
					renderedHtml: versionToPublish.renderedHtml,
					isMajor: true,
					description,
					subject: versionToPublish.subject,
					fromEmail: versionToPublish.fromEmail,
					replyTo: versionToPublish.replyTo,
					previewText: versionToPublish.previewText,
				}),
				credentials: "include",
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to publish version.");
			}

			// 2. Sync the template baseline so reopening always finds the published content
			await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: versionToPublish.content,
					subject: versionToPublish.subject,
					fromEmail: versionToPublish.fromEmail,
					replyTo: versionToPublish.replyTo,
					previewText: versionToPublish.previewText,
				}),
				credentials: "include",
			}).catch((err) =>
				console.warn("[publish] Failed to sync template baseline:", err),
			);

			const result = await response.json();
			const pubNum = result.publishNumber ?? null;

			toast.success(
				pubNum
					? `Published version as v${pubNum}`
					: "Version published successfully!",
			);

			setIsPublishModalOpen(false);
			setVersionToPublish(null);
			mutate();
			mutateTemplate();
		} catch (error) {
			console.error("Failed to publish version from history:", error);
			const err = error as Error;
			toast.error(err.message || "Failed to publish version.");
		} finally {
			setIsPublishing(false);
		}
	};

	// Clean list containing all versions
	const currentList = versions || [];

	const majorVersions = currentList.filter((v) => v.isMajor);

	const getMajorVersionNumber = (versionId: string) => {
		const index = majorVersions.findIndex((v) => v.id === versionId);
		if (index === -1) return null;
		return majorVersions.length - index;
	};

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-4 pl-6">
				<h2 className="font-semibold text-label-lg text-text-strong-950">
					Version History
				</h2>
				<button
					type="button"
					onClick={() => setViewMode("ai")}
					className="rounded-lg p-1.5 text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<Icon name="cross" className="h-[18px] w-[18px]" />
				</button>
			</div>

			{/* Version List */}
			<div className="flex-1 overflow-y-auto px-4 pb-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner size={18} />
					</div>
				) : currentList.length === 0 ? (
					<div className="space-y-3 px-4 py-12 text-center">
						<div className="mx-auto flex size-10 items-center justify-center rounded-full bg-bg-soft-200">
							<Icon
								name="clock"
								className="h-[18px] w-[18px] text-text-disabled-300"
							/>
						</div>
						<div className="space-y-1">
							<p className="font-semibold text-text-strong-950 text-xs">
								No versions yet
							</p>
							<p className="mx-auto max-w-[180px] text-[11px] text-text-soft-400 leading-normal">
								Click "Save Draft" or "Publish" in the header to record version
								history.
							</p>
						</div>
					</div>
				) : (
					<div className="relative flex flex-col">
						{currentList.map((version, index) => {
							const isDeleting = deletingId === version.id;

							const isFirstMajor = majorVersions[0]?.id === version.id;
							const isActive = template?.currentVersion
								? version.version === template.currentVersion
								: version.isMajor && isFirstMajor;
							const majorNum = getMajorVersionNumber(version.id);
							const displayLabel = version.isMajor ? `v${majorNum}.0` : "Draft";

							return (
								<div
									ref={(el) => {
										if (el) itemRefs.current[index] = el;
									}}
									key={version.id}
									onClick={() => handleRestore(version)}
									onPointerEnter={() => setHoverIdx(index)}
									onPointerLeave={() => setHoverIdx(undefined)}
									className="group relative flex w-full cursor-pointer items-stretch rounded-xl px-2 transition-all"
								>
									{/* Timeline Left Column */}
									<div className="relative flex w-[40px] shrink-0 flex-col items-center pt-4 pb-4">
										{/* Line segment */}
										{currentList.length > 1 && (
											<div
												className={cn(
													"-translate-x-1/2 absolute left-1/2 w-[1px] bg-stroke-soft-200",
													index === 0
														? "top-[26px] bottom-0"
														: index === currentList.length - 1
															? "top-0 h-[26px]"
															: "top-0 bottom-0",
												)}
											/>
										)}

										{/* Badge / Dot container */}
										{version.isMajor ? (
											<span
												className={cn(
													"relative z-10 flex h-[20px] w-[40px] select-none items-center justify-center rounded-full font-semibold text-[10px] transition-all",
													isActive
														? "bg-bg-strong-950 text-static-white"
														: "bg-bg-weak-50 text-text-sub-600",
												)}
											>
												{displayLabel}
											</span>
										) : (
											<div className="relative z-10 flex h-[20px] w-[40px] items-center justify-center">
												<div className="h-[6px] w-[6px] rounded-full bg-stroke-soft-200" />
											</div>
										)}
									</div>

									{/* Content Column */}
									<div className="flex min-w-0 flex-1 flex-col justify-start pt-4 pr-[92px] pb-4 pl-4">
										<h4 className="break-words font-medium text-label-sm text-text-strong-950 leading-snug">
											{version.description ||
												version.name ||
												(version.isMajor
													? "Published version"
													: "Draft version")}
										</h4>
										<div className="mt-1 flex items-center gap-1.5 text-paragraph-xs text-text-soft-400">
											<Avatar.Root size="16" color="gray" className="shrink-0">
												{version.createdBy?.image && (
													<Avatar.Image
														src={version.createdBy.image}
														alt={
															version.createdBy.name ||
															version.createdBy.email ||
															"Developer"
														}
													/>
												)}
												<Avatar.Image asChild>
													<span
														className={cn(
															"flex h-full w-full items-center justify-center font-medium text-[8px] text-static-white",
															getAvatarGradient(
																version.createdBy?.email ||
																	"developer@reloop.co",
															),
														)}
													>
														{getAvatarInitial(
															version.createdBy?.name || null,
															version.createdBy?.email || "developer@reloop.co",
														)}
													</span>
												</Avatar.Image>
											</Avatar.Root>
											<Tooltip.Root>
												<Tooltip.Trigger asChild>
													<span className="truncate">
														{version.createdBy?.name ||
															version.createdBy?.email ||
															"Developer"}
													</span>
												</Tooltip.Trigger>
												{version.createdBy?.email && (
													<Tooltip.Content
														side="top"
														variant="light"
														className="flex items-center gap-2 rounded-2xl p-4"
													>
														<Avatar.Root
															size="24"
															color="gray"
															className="shrink-0"
														>
															{version.createdBy?.image && (
																<Avatar.Image
																	src={version.createdBy.image}
																	alt={
																		version.createdBy.name ||
																		version.createdBy.email ||
																		"Developer"
																	}
																/>
															)}
															<Avatar.Image asChild>
																<span
																	className={cn(
																		"flex h-full w-full items-center justify-center font-medium text-static-white",
																		getAvatarGradient(
																			version.createdBy?.email ||
																				"developer@reloop.co",
																		),
																	)}
																>
																	{getAvatarInitial(
																		version.createdBy?.name || null,
																		version.createdBy?.email ||
																			"developer@reloop.co",
																	)}
																</span>
															</Avatar.Image>
														</Avatar.Root>
														<div className="flex min-w-0 flex-col gap-0.5">
															<span className="break-all font-medium leading-tight">
																{version.createdBy.email}
															</span>
														</div>
													</Tooltip.Content>
												)}
											</Tooltip.Root>
											<span className="shrink-0">•</span>
											<span className="shrink-0">
												{formatRelativeTime(version.createdAt)}
											</span>
										</div>
									</div>

									{/* Interactive Actions (shown on hover, no backgrounds/borders) */}
									<div className="-translate-y-1/2 absolute top-[26px] right-4 flex translate-x-2 items-center gap-1 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">
										{/* Publish action */}
										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<Button.Root
													variant="neutral"
													mode="ghost"
													size="xxsmall"
													onClick={(e) => {
														e.stopPropagation();
														setVersionToPublish(version);
														setIsPublishModalOpen(true);
													}}
													className="size-6 rounded-md p-1 text-text-sub-600 transition-all duration-150 ease-out hover:bg-bg-weak-50 active:scale-95"
												>
													<Icon name="file-upload" className="h-3.5 w-3.5" />
												</Button.Root>
											</Tooltip.Trigger>
											<Tooltip.Content side="top" variant="light">
												{version.isMajor
													? "Republish Version"
													: "Publish Draft"}
											</Tooltip.Content>
										</Tooltip.Root>

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
													className="size-6 rounded-md p-1 text-text-sub-600 transition-all duration-150 ease-out hover:bg-bg-weak-50 active:scale-95"
												>
													<Icon name="eye-outline" className="h-3.5 w-3.5" />
												</Button.Root>
											</Tooltip.Trigger>
											<Tooltip.Content side="top" variant="light">
												Preview
											</Tooltip.Content>
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
															label: version.isMajor
																? displayLabel
																: "Draft version",
														});
														setIsDeleteModalOpen(true);
													}}
													disabled={isDeleting}
													className="size-6 rounded-md p-1 text-text-sub-600 transition-all duration-150 ease-out hover:bg-error-lighter hover:text-error-base active:scale-95 disabled:opacity-50"
												>
													{isDeleting ? (
														<Spinner size={13} />
													) : (
														<Icon name="trash" className="h-3.5 w-3.5" />
													)}
												</Button.Root>
											</Tooltip.Trigger>
											<Tooltip.Content side="top" variant="light">
												Delete
											</Tooltip.Content>
										</Tooltip.Root>
									</div>
								</div>
							);
						})}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentItem}
							className="rounded-2xl!"
						/>
					</div>
				)}
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

			<PublishVersionModal
				isOpen={isPublishModalOpen}
				onClose={() => {
					setIsPublishModalOpen(false);
					setVersionToPublish(null);
				}}
				onConfirm={handlePublishVersion}
				isPublishing={isPublishing}
				versionLabel={
					versionToPublish
						? versionToPublish.name ||
							(versionToPublish.isMajor
								? `v${getMajorVersionNumber(versionToPublish.id)}.0`
								: "Draft")
						: "Draft"
				}
				isAlreadyPublished={versionToPublish ? versionToPublish.isMajor : false}
			/>
		</div>
	);
}
