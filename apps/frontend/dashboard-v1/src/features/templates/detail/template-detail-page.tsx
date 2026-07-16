import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import {
	useInvalidateTemplates,
	useTemplateDetailQuery,
} from "#/features/templates/hooks/use-templates-query";
import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { EditorContent, useEditor } from "@tiptap/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import "@react-email/editor/themes/default.css";

/**
 * Template detail for dashboard-v1.
 * Full collaboration / inspector builder remains on the Next app;
 * this page loads the template, renames, and shows a live preview.
 */
export function TemplateDetailPage({ templateId }: { templateId: string }) {
	const navigate = useNavigate();
	const invalidate = useInvalidateTemplates();
	const { data, error, isPending, isFetching, refetch } =
		useTemplateDetailQuery(templateId);
	const isLoading = isPending || (isFetching && !data);

	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);

	useEffect(() => {
		if (data?.name) setName(data.name);
	}, [data?.name]);

	const editor = useEditor(
		{
			extensions: [StarterKit.configure({ UndoRedo: false }), EmailTheming],
			content: {
				type: "doc",
				content: (data?.content as never[]) || [],
			},
			editable: false,
			immediatelyRender: false,
		},
		[templateId],
	);

	useEffect(() => {
		if (editor && data?.content) {
			editor.commands.setContent({
				type: "doc",
				content: data.content as never[],
			});
		}
	}, [editor, data?.content]);

	const handleSaveName = async () => {
		if (!data || !name.trim() || name === data.name) {
			setIsEditingName(false);
			return;
		}
		setIsSaving(true);
		try {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: name.trim() }),
			});
			if (!res.ok) throw new Error("Failed to save");
			toast.success("Template renamed");
			await invalidate();
			await refetch();
			setIsEditingName(false);
		} catch {
			toast.error("Failed to rename template");
		} finally {
			setIsSaving(false);
		}
	};

	if (error && !data) {
		return (
			<div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-3 px-6">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-sm text-text-sub-600">Failed to load template</p>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() => void refetch()}
				>
					Retry
				</Button.Root>
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto max-w-3xl px-6 py-16 text-center">
				<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
					Template not found
				</h2>
				<p className="mb-6 text-text-sub-600">
					This template may have been deleted.
				</p>
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={() => void navigate({ to: "/templates" })}
				>
					Back to templates
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-6 py-8 lg:px-8">
			<div className="pt-2">
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/templates" })}
				/>
			</div>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					{isLoading ? (
						<Skeleton className="h-8 w-48 rounded-lg" />
					) : isEditingName ? (
						<form
							className="flex flex-wrap items-center gap-2"
							onSubmit={(e) => {
								e.preventDefault();
								void handleSaveName();
							}}
						>
							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								// biome-ignore lint/a11y/noAutofocus: rename focus
								autoFocus
								disabled={isSaving}
								className="min-w-[200px] border-0 border-b border-stroke-soft-200 bg-transparent px-0 py-1 font-medium text-text-strong-950 text-title-h6 focus:border-text-strong-950 focus:outline-none"
							/>
							<Button.Root
								type="submit"
								variant="neutral"
								size="xxsmall"
								disabled={isSaving || !name.trim()}
							>
								{isSaving ? <Spinner size={14} /> : "Save"}
							</Button.Root>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xxsmall"
								onClick={() => {
									setName(data?.name || "");
									setIsEditingName(false);
								}}
								disabled={isSaving}
							>
								Cancel
							</Button.Root>
						</form>
					) : (
						<div className="flex items-center gap-2">
							<h1 className="font-medium text-title-h6 text-text-strong-950">
								{data?.name}
							</h1>
							<button
								type="button"
								onClick={() => setIsEditingName(true)}
								className="flex h-7 w-7 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-neutral-alpha-10"
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
							</button>
						</div>
					)}
					{data && (
						<div className="mt-2 flex items-center gap-2">
							<span
								className={cn(
									"rounded-md border px-1.5 py-0.5 font-semibold text-[10px] capitalize",
									data.status === "published" &&
										"border-success-base/20 bg-success-base/5 text-success-base",
									data.status === "draft" &&
										"border-amber-600/20 bg-amber-600/5 text-amber-600",
									data.status === "archived" &&
										"border-text-sub-600/20 bg-text-sub-600/5 text-text-sub-600",
								)}
							>
								{data.status}
							</span>
							{data.subject && (
								<span className="truncate text-paragraph-sm text-text-sub-600">
									{data.subject}
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Preview card */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-zinc-900">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/40">
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						Preview
					</span>
					<span className="text-[11px] text-text-soft-400">
						Visual editor with full tooling is still on the Next dashboard
					</span>
				</div>
				<div className="min-h-[420px] bg-bg-weak-50/40 p-6 dark:bg-black/20">
					{isLoading || !editor ? (
						<div className="flex h-[380px] items-center justify-center">
							<Spinner size={24} />
						</div>
					) : (
						<div className="mx-auto max-w-[600px] overflow-hidden rounded-lg border border-stroke-soft-100 bg-white shadow-sm dark:border-stroke-soft-100/30">
							<div className="[&_.tiptap]:min-h-[360px] [&_.tiptap]:p-6">
								<EditorContent editor={editor} />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
