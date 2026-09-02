import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import { play } from "cuelume";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/hooks/use-template-id";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { SlideToPublish } from "../../header/publish-template-modal";
import { PreviewModal } from "../../preview/preview-modal";

const viewModes = ["visual", "code", "history", "variables", "test"] as const;

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
				className="rounded-2xl border border-stroke-soft-100 p-0.5 font-sans sm:max-w-[400px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<Modal.Header className="before:border-stroke-soft-100 dark:before:border-stroke-soft-100/40">
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
					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100 dark:border-stroke-soft-100/40">
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

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
	const [status, setStatus] = useState<"idle" | "publishing" | "success">("idle");
	const [description, setDescription] = useState("");

	const isBusy = status === "publishing" || isPublishing;

	const handleClose = () => {
		if (status === "publishing") return;
		onClose();
	};

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setDescription("");
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const handlePublish = async () => {
		if (isBusy) return;

		setStatus("publishing");
		try {
			await onConfirm(description.trim());
			setStatus("success");
			setTimeout(() => {
				onClose();
			}, 1800);
		} catch (error) {
			console.error("Failed to publish version:", error);
			setStatus("idle");
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<Modal.Content
				className="min-h-[270px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[400px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<div className="flex min-h-[270px] flex-col justify-between">
					<div className="relative m-0.5 flex-1 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						<AnimatePresence mode="popLayout">
							{status === "success" ? (
								<motion.div
									key="success"
									initial={{ y: -32, opacity: 0, filter: "blur(4px)" }}
									animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ type: "spring", duration: 0.4, bounce: 0 }}
									className="flex min-h-[266px] flex-col items-center justify-center p-6 text-center"
								>
									<svg
										width="36"
										height="36"
										viewBox="0 0 32 32"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="text-primary-base"
									>
										<path
											d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
											fill="currentColor"
											fillOpacity="0.16"
										/>
										<path
											d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
											stroke="currentColor"
											strokeWidth="2.4"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<h3 className="mt-3 font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
										{versionLabel} published!
									</h3>
									<p className="mt-1 text-text-sub-600 text-xs dark:text-text-sub-400">
										This version is now active.
									</p>
								</motion.div>
							) : (
								<motion.div
									key="form-fields"
									exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
									transition={{ type: "spring", duration: 0.4, bounce: 0 }}
									className="space-y-4 pt-5"
								>
									{/* Header without icon */}
									<div className="flex items-center justify-between px-6 dark:border-stroke-soft-100/40">
										<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
											Publish {versionLabel}
										</Modal.Title>
										<button
											type="button"
											onClick={handleClose}
											aria-label="Close"
											disabled={isBusy}
											className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
										>
											<X className="size-3.5" strokeWidth={2.25} />
										</button>
									</div>

									{/* Form Content */}
									<div className="space-y-4 px-6 pb-6">
										{!isAlreadyPublished && (
											<div className="space-y-1.5">
												<Label.Root
													htmlFor="versionChangelogDescription"
													className="font-semibold text-sm text-text-strong-950 dark:text-white"
												>
													Release description
												</Label.Root>
												<Textarea.Root
													id="versionChangelogDescription"
													simple
													placeholder="Describe what changed in this version (e.g. fixed layout issues, added welcome banner)..."
													value={description}
													onChange={(e) => setDescription(e.target.value)}
													disabled={isBusy}
													className="min-h-[108px] resize-none rounded-xl text-text-strong-950 text-xs dark:text-white"
													autoFocus
												/>
											</div>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Actions / Footer with Slide to Confirm */}
					{status !== "success" && (
						<div className="relative p-2.5 pb-4">
							<SlideToPublish
								onPublish={handlePublish}
								isPublishing={isBusy}
								isSuccess={false}
								disabled={isBusy}
							/>
						</div>
					)}
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

			mutate();
			mutateTemplate();
		} catch (error) {
			console.error("Failed to publish version from history:", error);
			const err = error as Error;
			toast.error(err.message || "Failed to publish version.");
			throw error;
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
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 font-sans dark:bg-black">
			{/* ── Header ── */}
			<div className="flex shrink-0 items-center justify-between gap-2 py-2 pr-3 pl-2.5">
				<h2 className="font-semibold text-label-sm text-text-strong-950">
					Version History
				</h2>
			</div>

			{/* ── Scrollable Body ── */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-6">
						<Spinner size={16} />
					</div>
				) : currentList.length === 0 ? (
					<div className="rounded-xl px-4 py-4 text-center">
						<div className="mx-auto flex size-8 items-center justify-center rounded-xl bg-bg-soft-200 text-text-sub-600 dark:bg-bg-soft-200/50">
							<Icon name="clock" className="h-3.5 w-3.5" />
						</div>
						<p className="mt-2 font-semibold text-text-strong-950 text-xs">
							No versions yet
						</p>
						<p className="mt-1 text-[11px] text-text-soft-400 leading-normal">
							Edits save automatically. Publish to record version history.
						</p>
					</div>
				) : (
					<div className="relative flex flex-col px-2.5 pb-6">
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
