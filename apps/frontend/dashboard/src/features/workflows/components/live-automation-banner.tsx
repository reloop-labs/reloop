"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Workflow } from "../workflow-types";
import { useWorkflows } from "./workflows-provider";

export const LiveAutomationBanner = ({ workflow }: { workflow: Workflow }) => {
	const router = useRouter();
	const { createWorkflow, updateWorkflow } = useWorkflows();
	const [dismissed, setDismissed] = useState(false);
	const [duplicating, setDuplicating] = useState(false);

	if (dismissed) return null;

	const handleDuplicate = async () => {
		if (duplicating) return;
		setDuplicating(true);
		try {
			const created = await createWorkflow({
				name: `${workflow.name} (Copy)`,
				description: workflow.description ?? undefined,
			});
			if (workflow.nodes?.length || workflow.edges?.length) {
				await updateWorkflow(created.id, {
					nodes: workflow.nodes,
					edges: workflow.edges,
				});
			}
			toast.success(`Duplicated "${workflow.name}"`);
			router.push(`/automation/${created.id}`);
		} catch {
			toast.error("Failed to duplicate automation");
		} finally {
			setDuplicating(false);
		}
	};

	return (
		<div className="absolute right-6 bottom-6 z-20 w-[380px] max-w-[calc(100%-3rem)] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-[#17171c] dark:text-white">
			<button
				type="button"
				onClick={() => setDismissed(true)}
				aria-label="Dismiss"
				className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
			>
				<Icon name="close" className="h-3.5 w-3.5" />
			</button>
			<div className="flex items-start gap-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/10">
					<Icon
						name="lock"
						className="h-4 w-4 text-text-sub-600 dark:text-white/80"
					/>
				</span>
				<div className="min-w-0 flex-1 pr-6">
					<p className="font-semibold text-[14px] leading-snug">
						You cannot edit a live automation
					</p>
					<p className="mt-1 text-[13px] text-text-sub-600 leading-snug dark:text-white/60">
						Duplicate it to make changes. In-flight runs will keep executing
						this version.
					</p>
					<FancyButton.Root
						variant="blue"
						size="xsmall"
						onClick={() => void handleDuplicate()}
						disabled={duplicating}
						className="mt-3"
					>
						{duplicating ? "Duplicating…" : "Duplicate automation"}
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
};
