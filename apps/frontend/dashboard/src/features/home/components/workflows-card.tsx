import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWorkflowsList } from "#/features/workflows/hooks/use-workflows-list";

type WorkflowsCardProps = {
	enabled?: boolean;
};

export function WorkflowsCard({ enabled = true }: WorkflowsCardProps) {
	const { workflows, isTotalEmpty, isLoading } = useWorkflowsList({
		limit: 5,
		enabled,
	});

	return (
		<div className="group flex w-full flex-col">
			<Link
				href="/workflows"
				className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-5 dark:border-white/5 dark:bg-white/[0.02]"
			>
				<span className="flex items-center gap-2 font-medium text-sm text-text-sub-600 dark:text-white/60">
					<Icon name="workflow" className="h-4 w-4 shrink-0" />
					Workflows
					<span className="rounded bg-purple-100 px-1 py-0.2 font-semibold text-[8px] text-purple-800 uppercase dark:bg-purple-500/25 dark:text-purple-300">
						New
					</span>
				</span>
				<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
			</Link>

			{isLoading ? (
				<div className="-mt-2.5 flex h-[200px] items-center justify-center rounded-xl border border-stroke-soft-100 bg-white dark:border-white/5 dark:bg-white/[0.02]">
					<span className="text-text-sub-600 text-xs dark:text-white/40">
						Loading workflows…
					</span>
				</div>
			) : !isTotalEmpty && workflows.length > 0 ? (
				<div className="-mt-2.5 h-[200px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{workflows.slice(0, 3).map((workflow) => (
							<Link
								key={workflow.id}
								href={`/workflows/${workflow.id}`}
								className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
							>
								<div className="flex min-w-0 flex-col pr-2">
									<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
										{workflow.name}
									</span>
									<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
										{workflow.description || "No description"}
									</span>
								</div>
								<div className="flex items-center justify-center">
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
											workflow.status === "active"
												? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
												: workflow.status === "paused"
													? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
													: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
										)}
									>
										{workflow.status}
									</span>
								</div>
								<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
									{new Date(workflow.updatedAt).toLocaleDateString([], {
										month: "short",
										day: "numeric",
									})}
								</div>
							</Link>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-2.5 flex h-[200px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<Icon
						name="workflow"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Build automations without the overhead
					</h4>
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						From triggers to multi-step actions — automate your flows in
						minutes.
					</p>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/workflows">Start building</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
