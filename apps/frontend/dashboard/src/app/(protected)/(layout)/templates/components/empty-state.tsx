"use client";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const EmptyState = () => {
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateTemplate = async () => {
		setIsCreating(true);
		try {
			const response = await fetch("/api/template/v1/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name: "Untitled",
					content: [],
				}),
			});

			if (response.ok) {
				const template = await response.json();
				router.push(getBackToUrl(`/templates/${template.id}`));
			}
		} catch (error) {
			console.error("Failed to create template:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="flex flex-col items-center border-stroke-soft-100 bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="file-text" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				No templates yet
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				Design reusable emails with drag-and-drop. Start from scratch or pick a
				preset layout.
			</p>
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleCreateTemplate}
					disabled={isCreating}
					className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
				>
					{isCreating ? (
						<Spinner size={14} />
					) : (
						<Icon name="plus" className="h-4 w-4" />
					)}
					{isCreating ? "Creating..." : "Create Template"}
				</Button.Root>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					asChild
					className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
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
