"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { EditorContent, useEditor } from "@tiptap/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DeleteTemplateModal } from "./delete-template-modal";
import "@react-email/editor/themes/default.css";

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
						"h-8 w-8 rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-sm transition-all dark:border-stroke-soft-100/50",
						popoverOpen
							? "opacity-100"
							: "opacity-0 group-hover/card:opacity-100",
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

const EMAIL_WIDTH = 600;

const TemplatePreviewThumbnail = ({ template }: { template: Template }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0.5);
	const PAPER_INSET = 0;

	const editor = useEditor(
		{
			extensions: [StarterKit.configure({ UndoRedo: false }), EmailTheming],
			content: { type: "doc", content: template.content || [] },
			editable: false,
			immediatelyRender: false,
		},
		[template.id],
	);

	useEffect(() => {
		if (editor && template.content) {
			editor.commands.setContent({
				type: "doc",
				content: template.content,
			});
		}
	}, [editor, template.content]);

	useEffect(() => {
		if (!containerRef.current) return;
		const el = containerRef.current;
		const updateScale = () => {
			const paperWidth = el.offsetWidth - PAPER_INSET * 2;
			setScale(paperWidth / EMAIL_WIDTH);
		};
		updateScale();
		const observer = new ResizeObserver(updateScale);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	if (!editor) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-0 select-none overflow-hidden"
			style={{ padding: `${PAPER_INSET}px` }}
		>
			<div className="relative h-full w-full overflow-hidden rounded-md">
				<div
					className="[&_img]:!max-w-full [&_.tiptap]:!p-0 [&_.tiptap]:!m-0 [&_.tiptap]:!min-h-0 [&_.tiptap]:!w-full [&_.tiptap]:!overflow-hidden [&_img]:h-auto"
					style={{
						width: `${EMAIL_WIDTH}px`,
						overflow: "hidden",
						transform: `scale(${scale})`,
						transformOrigin: "top left",
					}}
				>
					<EditorContent editor={editor} />
				</div>

				{/* Bottom fade */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-zinc-900" />
			</div>
		</div>
	);
};

const TemplateSkeleton = () => (
	<div className="group relative flex flex-col gap-3">
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/20 dark:bg-zinc-900/40" />
		<div className="flex items-start justify-between px-0.5">
			<div className="mr-4 flex flex-1 flex-col gap-1.5">
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
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<TemplateSkeleton key={`skeleton-${i}`} />
					))
				) : templates.length === 0 ? (
					<div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-stroke-soft-100 p-12 text-center dark:border-stroke-soft-100/40">
						<p className="text-sm text-text-sub-600">No templates found</p>
					</div>
				) : (
					templates.map((template) => {
						const isCardActive = activeDropdownId === template.id;

						return (
							<div
								key={template.id}
								className="group/card relative flex cursor-pointer flex-col gap-3 transition-all duration-200"
							>
								{/* Preview Canvas Container (The SINGLE border outline) */}
								<div
									className={cn(
										"relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 dark:bg-zinc-900",
										isCardActive
											? "border-stroke-soft-200 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-stroke-soft-100"
											: "border-stroke-soft-100 hover:border-stroke-soft-200",
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
								<div className="flex items-start justify-between px-0.5">
									<div className="mr-4 flex min-w-0 flex-1 flex-col gap-0.5">
										<span
											className="truncate font-semibold text-sm text-text-strong-950 dark:text-white"
											title={template.name}
										>
											{template.name}
										</span>
										{template.description && (
											<span className="truncate font-mono text-text-sub-600 text-xs leading-none dark:text-zinc-500">
												{template.description}
											</span>
										)}
									</div>

									<span
										className={cn(
											"shrink-0 select-none rounded-md border px-1.5 py-0.5 font-semibold text-[10px] capitalize",
											template.status === "published" &&
												"border-success-base/20 bg-success-base/5 text-success-base",
											template.status === "draft" &&
												"border-amber-600/20 bg-amber-600/5 text-amber-600 dark:text-amber-500",
											template.status === "archived" &&
												"border-text-sub-600/20 bg-text-sub-600/5 text-text-sub-600",
										)}
									>
										{template.status}
									</span>
								</div>
							</div>
						);
					})
				)}
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
