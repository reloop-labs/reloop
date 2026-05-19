"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { DeleteTemplateModal } from "./delete-template-modal";

dayjs.extend(relativeTime);

interface Template {
	id: string;
	name: string;
	description: string | null;
	subject: string | null;
	status: "draft" | "published" | "archived";
	content?: any[] | null;
	createdAt: string;
	updatedAt: string;
}

interface TemplateGridProps {
	templates: Template[];
	isLoading: boolean;
	loadingRows?: number;
	onMutate: () => void;
}

interface TemplateDropdownProps {
	templateId: string;
	templateName: string;
	onDuplicate: (id: string) => Promise<void>;
	onDelete: (id: string, name: string) => void;
	onOpenChange?: (open: boolean) => void;
}

const TemplateDropdown = ({
	templateId,
	templateName,
	onDuplicate,
	onDelete,
	onOpenChange,
}: TemplateDropdownProps) => {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
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

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = async (itemId: string) => {
		setPopoverOpen(false);
		if (itemId === "duplicate") {
			await onDuplicate(templateId);
		} else if (itemId === "delete") {
			onDelete(templateId, templateName);
		}
	};

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn(
						"h-8 w-8 rounded-lg border border-stroke-soft-100 dark:border-stroke-soft-100/50 bg-bg-white-0 shadow-sm p-1.5 transition-all",
						popoverOpen ? "opacity-100" : "opacity-0 group-hover/card:opacity-100",
					)}
				>
					<Icon name="more-horizontal" className="h-4 w-4" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={4}
				className="w-40 rounded-xl p-1.5"
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<button
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleItemClick(item.id)}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
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
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</PopoverContent>
		</PopoverRoot>
	);
};

const extractTextFromContent = (content?: any[] | null): string => {
	if (!content || !Array.isArray(content)) return "";
	let text = "";
	for (const node of content) {
		if (node.type === "text" && node.text) {
			text += node.text + " ";
		}
		if (node.content) {
			text += extractTextFromContent(node.content);
		}
	}
	return text;
};

const TemplatePreviewThumbnail = ({ template }: { template: Template }) => {


	const extractedText = extractTextFromContent(template.content).trim();

	return (
		<div className="flex flex-col gap-3 p-4 text-[10px] text-text-strong-950 dark:text-white font-sans h-full justify-center overflow-hidden">
			<div className="font-bold text-[13px] leading-tight truncate pr-6">
				{template.subject || template.name}
			</div>
			{extractedText ? (
				<div className="text-text-sub-600 dark:text-text-sub-600/80 leading-relaxed line-clamp-4 break-words">
					{extractedText}
				</div>
			) : (
				<div className="space-y-1.5 mt-1">
					<div className="h-1.5 w-full bg-neutral-alpha-10 dark:bg-white/10 rounded" />
					<div className="h-1.5 w-5/6 bg-neutral-alpha-10 dark:bg-white/10 rounded" />
					<div className="h-1.5 w-4/6 bg-neutral-alpha-10 dark:bg-white/10 rounded" />
				</div>
			)}
		</div>
	);
};

const TemplateSkeleton = () => (
	<div className="group relative flex flex-col gap-3">
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/20 bg-bg-weak-50/50 dark:bg-zinc-900/40 p-4" />
		<div className="flex justify-between items-start px-0.5">
			<div className="flex flex-col gap-1.5 flex-1 mr-4">
				<Skeleton className="h-4 w-3/4 rounded" />
				<Skeleton className="h-3 w-1/2 rounded" />
			</div>
			<Skeleton className="h-5 w-12 rounded-md" />
		</div>
	</div>
);

export const TemplateGrid = ({
	templates,
	isLoading,
	loadingRows = 6,
	onMutate,
}: TemplateGridProps) => {
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const handleDuplicate = async (id: string) => {
		try {
			await fetch(`/api/template/v1/${id}/duplicate`, {
				method: "POST",
				credentials: "include",
			});
			onMutate();
		} catch (error) {
			console.error("Failed to duplicate template:", error);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!templateToDelete) return;
		try {
			await fetch(`/api/template/v1/${templateToDelete.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			onMutate();
		} catch (error) {
			console.error("Failed to delete template:", error);
		} finally {
			setIsDeleteModalOpen(false);
			setTemplateToDelete(null);
		}
	};

	const handleDeleteClick = (id: string, name: string) => {
		setTemplateToDelete({ id, name });
		setIsDeleteModalOpen(true);
	};

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence>
					{isLoading ? (
						Array.from({ length: loadingRows }).map((_, i) => (
							<TemplateSkeleton key={`skeleton-${i}`} />
						))
					) : templates.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
							<p className="text-sm text-text-sub-600">No templates found</p>
						</div>
					) : (
						templates.map((template, index) => {
							const isCardActive = activeDropdownId === template.id;

							return (
								<motion.div
									key={template.id}
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -15 }}
									transition={{ delay: index * 0.05 }}
								>
									<div
										className="group/card relative flex flex-col gap-3 transition-all duration-200 cursor-pointer"
									>
										{/* Preview Canvas Container (The SINGLE border outline) */}
										<div
											className={cn(
												"relative aspect-[4/3] w-full overflow-hidden rounded-2xl border transition-all duration-200 bg-bg-white-0 dark:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
												isCardActive
													? "border-stroke-soft-200 dark:border-stroke-soft-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
													: "border-stroke-soft-100 dark:border-stroke-soft-100/40 hover:border-stroke-soft-200 dark:hover:border-stroke-soft-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
											)}
										>
											{/* Clean simulated email content directly on the canvas background */}
											<TemplatePreviewThumbnail template={template} />

											{/* Floating actions menu wrapper (Higher z-index so click stops propagation correctly) */}
											<div
												className="absolute top-2.5 right-2.5 z-10 text-text-soft-400"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
											>
												<TemplateDropdown
													templateId={template.id}
													templateName={template.name}
													onDuplicate={handleDuplicate}
													onDelete={handleDeleteClick}
													onOpenChange={(open) =>
														setActiveDropdownId(open ? template.id : null)
													}
												/>
											</div>

											{/* Clickable Overlay Link to Editor (Base z-index) */}
											<Link
												href={`/templates/${template.id}`}
												className="absolute inset-0 z-0"
												aria-label={`Edit ${template.name}`}
											/>
										</div>

										{/* Bottom Info Row */}
										<div className="flex justify-between items-start px-0.5">
											<div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-4">
												<span className="font-semibold text-sm text-text-strong-950 dark:text-white truncate" title={template.name}>
													{template.name}
												</span>
												<span className="text-xs text-text-sub-600 dark:text-zinc-500 font-mono leading-none truncate">
													{template.description || template.name.toLowerCase().replace(/\s+/g, "-")}
												</span>
											</div>

											<span
												className={cn(
													"rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize border select-none shrink-0",
													template.status === "published" && "bg-success-base/5 text-success-base border-success-base/20",
													template.status === "draft" && "bg-amber-600/5 text-amber-600 dark:text-amber-500 border-amber-600/20",
													template.status === "archived" && "bg-text-sub-600/5 text-text-sub-600 border-text-sub-600/20",
												)}
											>
												{template.status}
											</span>
										</div>
									</div>
								</motion.div>
							);
						})
					)}
				</AnimatePresence>
			</div>

			<DeleteTemplateModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setTemplateToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				templateName={templateToDelete?.name || "Template"}
			/>
		</div>
	);
};
