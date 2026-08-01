import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";
import {
	createTemplate,
	useInvalidateTemplates,
} from "#/features/templates/hooks/use-templates-query";

export const EmptyState = ({
	isFiltered = false,
	onClearFilters,
}: {
	isFiltered?: boolean;
	onClearFilters?: () => void;
}) => {
	const router = useRouter();
	const invalidate = useInvalidateTemplates();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateTemplate = async () => {
		if (isCreating) return;
		setIsCreating(true);
		try {
			const template = await createTemplate();
			await invalidate();
			router.push(`/templates/${template.id}`);
		} catch {
			toast.error("Failed to create template");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "layout"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{isFiltered ? "No templates found" : "Create your first template"}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{isFiltered
					? "Try adjusting your search or filters."
					: "Design reusable emails with drag-and-drop, then send them via API or campaigns."}
			</p>
			{isFiltered && onClearFilters ? (
				<button
					type="button"
					onClick={onClearFilters}
					className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 font-medium text-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear filters
				</button>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={() => void handleCreateTemplate()}
					disabled={isCreating}
					className="gap-1.5 rounded-xl"
				>
					{isCreating ? (
						<>
							<Spinner size={14} color="currentColor" />
							Creating...
						</>
					) : (
						<>
							<Icon name="plus" className="h-4 w-4" />
							Create template
						</>
					)}
				</FancyButton.Root>
			)}
		</div>
	);
};
