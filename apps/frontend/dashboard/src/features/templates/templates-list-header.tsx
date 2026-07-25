import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	createTemplate,
	useInvalidateTemplates,
} from "#/features/templates/hooks/use-templates-query";

const DOCS_URL = "https://reloop.sh/docs/learn/templates";

export function TemplatesListHeader() {
	const navigate = useNavigate();
	const invalidate = useInvalidateTemplates();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateTemplate = async () => {
		if (isCreating) return;
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

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		void handleCreateTemplate();
	});

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="layout"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Templates
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Design and manage reusable email templates for your product.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => window.open(DOCS_URL, "_blank")}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="video-guide" className="h-4 w-4 text-text-sub-600" />
					Video guide
				</Button.Root>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => window.open(DOCS_URL, "_blank")}
					className="rounded-xl"
				>
					Documentation
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={() => void handleCreateTemplate()}
					disabled={isCreating}
					className="min-w-[148px] gap-1.5 rounded-xl"
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
			</div>
		</div>
	);
}
