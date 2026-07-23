import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	createTemplate,
	useInvalidateTemplates,
} from "#/features/templates/hooks/use-templates-query";

export const EmptyState = () => {
	const navigate = useNavigate();
	const invalidate = useInvalidateTemplates();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateTemplate = async () => {
		setIsCreating(true);
		try {
			const template = await createTemplate();
			await invalidate();
			void navigate({
				to: "/templates/$templateId",
				params: { templateId: template.id },
			});
		} catch {
			toast.error("Failed to create template");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="flex flex-col items-center rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/40 px-6 py-16 text-center dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="file-text" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-label-lg text-text-strong-950">
				No templates yet
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance text-paragraph-xs text-text-sub-600">
				Design reusable emails with drag-and-drop. Start from scratch or pick a
				preset layout.
			</p>
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() => void handleCreateTemplate()}
					disabled={isCreating}
					className="gap-2"
				>
					{isCreating ? (
						<Spinner size={14} />
					) : (
						<Icon name="plus" className="h-4 w-4" />
					)}
					{isCreating ? "Creating..." : "Create template"}
				</Button.Root>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					asChild
					className="gap-2"
				>
					<a
						href="https://reloop.sh/docs/templates"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon name="book-open" className="h-3.5 w-3.5" />
						Read the docs
					</a>
				</Button.Root>
			</div>
		</div>
	);
};
