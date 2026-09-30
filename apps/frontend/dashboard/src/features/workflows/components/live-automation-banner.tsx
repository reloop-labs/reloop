"use client";

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
		<div className="absolute bottom-6 left-1/2 z-20 w-[380px] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#17171c] p-4 text-white shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
			<button
				type="button"
				onClick={() => setDismissed(true)}
				aria-label="Dismiss"
				className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
			>
				<Icon name="close" className="h-3.5 w-3.5" />
			</button>
			<div className="flex items-start gap-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
					<Icon name="lock" className="h-4 w-4 text-white/80" />
				</span>
				<div className="min-w-0 flex-1 pr-6">
					<p className="font-semibold text-[14px] leading-snug">
						You cannot edit a live automation
					</p>
					<p className="mt-1 text-[13px] leading-snug text-white/60">
						Duplicate it to make changes. In-flight runs will keep executing
						this version.
					</p>
					<button
						type="button"
						onClick={() => void handleDuplicate()}
						disabled={duplicating}
						className="mt-3 rounded-full bg-white px-4 py-2 font-semibold text-[13px] text-black transition-colors hover:bg-white/90 disabled:opacity-60"
					>
						{duplicating ? "Duplicating…" : "Duplicate automation"}
					</button>
				</div>
			</div>
		</div>
	);
};
