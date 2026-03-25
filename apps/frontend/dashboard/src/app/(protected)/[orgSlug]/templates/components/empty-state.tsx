"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EmptyStateProps {
	orgSlug: string;
}

export const EmptyState = ({ orgSlug }: EmptyStateProps) => {
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
				router.push(`/${orgSlug}/templates/${template.id}`);
			}
		} catch (error) {
			console.error("Failed to create template:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-weak-50">
				<Icon name="file-text" className="h-6 w-6 text-text-sub-600" />
			</div>
			<h3 className="mb-1 font-semibold text-lg text-text-strong-950">
				No templates yet
			</h3>
			<p className="mb-6 max-w-[280px] font-normal text-sm text-text-sub-600">
				Create your first email template to start building reusable email
				designs with our drag-and-drop editor.
			</p>
			<Button.Root
				variant="neutral"
				size="xsmall"
				onClick={handleCreateTemplate}
				disabled={isCreating}
			>
				{isCreating ? (
					<Spinner size={16} />
				) : (
					<Icon name="plus" className="h-4 w-4" />
				)}
				{isCreating ? "Creating..." : "Create your first template"}
			</Button.Root>
			<a
				href="https://reloop.sh/docs/templates"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="book-closed" className="h-3 w-3" />
				Learn more about templates
			</a>
		</div>
	);
};
