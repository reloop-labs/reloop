import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "#/lib/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { Template } from "#/features/templates/hooks/use-templates-query";
import { DeleteTemplateModal } from "./delete-template-modal";
import "@react-email/editor/themes/default.css";

interface TemplateGridProps {
	templates: Template[];
	isLoading: boolean;
	loadingRows?: number;
	onMutate: () => void;
	onDeleteSuccess?: (deletedName: string) => void;
}

interface TemplateDropdownProps {
	templateId: string;
	templateName: string;
	onDuplicate: (id: string) => Promise<void>;
	onDelete: (id: string, name: string) => void;
	onOpenChange?: (open: boolean) => void;
}

/** Kebab-case slug for the card subtitle (mockup: order-confirmation). */
function templateSlug(name: string, description: string | null): string {
	const fromDescription = description?.trim();
	if (fromDescription) return fromDescription;
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const TemplateDropdown = ({
	templateId,
	templateName,
	onDuplicate,
	onDelete,
	onOpenChange,
}: TemplateDropdownProps) => {
	const [open, setOpen] = useState(false);
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

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setHoverIdx(undefined);
		onOpenChange?.(next);
	};

	const handleItemClick = async (itemId: string) => {
		handleOpenChange(false);
		if (itemId === "duplicate") {
			await onDuplicate(templateId);
		} else if (itemId === "delete") {
			onDelete(templateId, templateName);
		}
	};

	return (
		<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
			<Dropdown.Trigger asChild>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					aria-label={`Actions for ${templateName}`}
					className={cn(
						"h-8 w-8 rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-regular-xs transition-all dark:border-stroke-soft-100/50",
						open ? "opacity-100" : "opacity-0 group-hover/card:opacity-100",
					)}
				>
					<Icon name="more-horizontal" className="h-4 w-4" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={6}
				className="w-40 gap-0 rounded-xl p-1.5"
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
							onClick={() => void handleItemClick(item.id)}
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
			</Dropdown.Content>
		</Dropdown.Root>
	);
};

const EMAIL_WIDTH = 600;
/** Soft inset so the email sits in a padded “stage” like the mockup. */
const PAPER_INSET = 28;

const TemplatePreviewThumbnail = ({ template }: { template: Template }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0.5);

	const editor = useEditor(
		{
			extensions: [StarterKit.configure({ UndoRedo: false }), EmailTheming],
			content: {
				type: "doc",
				content: (template.content as never[]) || [],
			},
			editable: false,
			immediatelyRender: false,
		},
		[template.id],
	);

	useEffect(() => {
		if (editor && template.content) {
			editor.commands.setContent({
				type: "doc",
				content: template.content as never[],
			});
		}
	}, [editor, template.content]);

	useEffect(() => {
		if (!containerRef.current) return;
		const el = containerRef.current;
		const updateScale = () => {
			const paperWidth = Math.max(el.offsetWidth - PAPER_INSET * 2, 1);
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
			{/* Soft white stage behind the email paper */}
			<div className="relative h-full w-full overflow-hidden rounded-xl bg-bg-white-0 shadow-regular-xs">
				<div
					className="[&_img]:!max-w-full [&_.tiptap]:!m-0 [&_.tiptap]:!min-h-0 [&_.tiptap]:!w-full [&_.tiptap]:!overflow-hidden [&_.tiptap]:!p-0 [&_img]:h-auto"
					style={{
						width: `${EMAIL_WIDTH}px`,
						overflow: "hidden",
						transform: `scale(${scale})`,
						transformOrigin: "top left",
					}}
				>
					<EditorContent editor={editor} />
				</div>
				{/* Soft fade into the card edges */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-white-0 via-bg-white-0/80 to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg-white-0/90 to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg-white-0/90 to-transparent" />
			</div>
		</div>
	);
};

function TemplateStatusBadge({ status }: { status: Template["status"] }) {
	// Mockup only surfaces a muted “Draft” pill; published stays badge-free.
	if (status === "published") return null;

	const label = status === "draft" ? "Draft" : "Archived";

	return (
		<span
			className={cn(
				"shrink-0 select-none rounded-full px-2.5 py-1 font-medium text-[11px] leading-none",
				status === "draft" &&
					"bg-bg-weak-50 text-text-sub-600 ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:text-text-sub-600 dark:ring-stroke-soft-100/40",
				status === "archived" &&
					"bg-faded-lighter text-faded-base ring-1 ring-stroke-soft-100 ring-inset",
			)}
		>
			{label}
		</span>
	);
}

const TemplateSkeleton = () => (
	<div className="group relative flex flex-col gap-3.5">
		<div
			className={cn(
				"relative aspect-[5/4] w-full overflow-hidden rounded-[28px]",
				"bg-bg-weak-50 dark:bg-bg-weak-50/40",
				"shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_32px_rgba(0,0,0,0.06)]",
				"dark:shadow-[0_0_40px_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)]",
			)}
		/>
		<div className="flex items-start justify-between gap-3 px-1">
			<div className="flex flex-1 flex-col gap-1.5">
				<Skeleton className="h-4 w-3/4 rounded" />
				<Skeleton className="h-3 w-1/2 rounded" />
			</div>
			<Skeleton className="h-6 w-14 rounded-full" />
		</div>
	</div>
);

export const TemplateGrid = ({
	templates,
	isLoading,
	loadingRows = 6,
	onMutate,
	onDeleteSuccess,
}: TemplateGridProps) => {
	const navigate = useNavigate();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const handleDuplicate = async (id: string) => {
		try {
			const res = await fetch(`/api/template/v1/${id}/duplicate`, {
				method: "POST",
				credentials: "include",
			});
			if (!res.ok) throw new Error("duplicate failed");
			onMutate();
			toast.success("Template duplicated");
		} catch {
			toast.error("Failed to duplicate template");
		}
	};

	const handleDeleteConfirm = async () => {
		if (!templateToDelete) return;
		const name = templateToDelete.name;
		try {
			const res = await fetch(`/api/template/v1/${templateToDelete.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) throw new Error("delete failed");
			onMutate();
			onDeleteSuccess?.(name);
		} catch {
			toast.error("Failed to delete template");
			throw new Error("delete failed");
		}
	};

	const handleDeleteClick = (id: string, name: string) => {
		setTemplateToDelete({ id, name });
		setIsDeleteModalOpen(true);
	};

	const openEditor = (id: string) => {
		void navigate({
			to: "/templates/$templateId",
			params: { templateId: id },
		});
	};

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<TemplateSkeleton key={`skeleton-${i}`} />
					))
				) : (
					templates.map((template) => {
						const isCardActive = activeDropdownId === template.id;
						const slug = templateSlug(template.name, template.description);

						return (
							<div
								key={template.id}
								className="group/card relative flex cursor-pointer flex-col gap-3.5"
							>
								{/* Preview stage — soft rounded card with ambient glow */}
								<div
									className={cn(
										"relative aspect-[5/4] w-full overflow-hidden rounded-[28px] transition-shadow duration-300",
										// Soft light fill + ambient glow (mockup)
										"bg-gradient-to-b from-bg-white-0 to-bg-weak-50",
										"dark:from-neutral-0 dark:to-bg-weak-50",
										"shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.08)]",
										"dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_48px_rgba(255,255,255,0.06),0_16px_48px_rgba(0,0,0,0.45)]",
										isCardActive &&
											"shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_56px_rgba(255,255,255,0.1),0_20px_56px_rgba(0,0,0,0.5)]",
										!isCardActive &&
											"group-hover/card:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.1)] dark:group-hover/card:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_56px_rgba(255,255,255,0.08),0_20px_56px_rgba(0,0,0,0.5)]",
									)}
								>
									{/* Soft radial wash so the email floats in the middle */}
									<div
										aria-hidden
										className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.03)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.25)_100%)]"
									/>

									<TemplatePreviewThumbnail template={template} />

									<div
										className="absolute top-3 right-3 z-10"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onKeyDown={(e) => e.stopPropagation()}
									>
										<TemplateDropdown
											templateId={template.id}
											templateName={template.name}
											onDuplicate={handleDuplicate}
											onDelete={handleDeleteClick}
											onOpenChange={(next) =>
												setActiveDropdownId(next ? template.id : null)
											}
										/>
									</div>

									<button
										type="button"
										className="absolute inset-0 z-0"
										aria-label={`Edit ${template.name}`}
										onClick={() => openEditor(template.id)}
									/>
								</div>

								{/* Meta — title + slug, optional status (mockup) */}
								<div className="flex items-start justify-between gap-3 px-1">
									<div className="mr-2 flex min-w-0 flex-1 flex-col gap-0.5">
										<span
											className="truncate font-semibold text-label-sm text-text-strong-950"
											title={template.name}
										>
											{template.name}
										</span>
										{slug ? (
											<span
												className="truncate text-paragraph-xs text-text-sub-600"
												title={slug}
											>
												{slug}
											</span>
										) : null}
									</div>

									<TemplateStatusBadge status={template.status} />
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
