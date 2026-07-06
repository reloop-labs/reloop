"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Workflow {
	id: string;
	name: string;
	description?: string;
	status: "draft" | "active";
	updatedAt: string;
}

export function WorkflowsCard() {
	const getBackToUrl = useGetBackToUrl();
	const { activeOrganization } = useUserOrganization();
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const orgSlug = activeOrganization?.slug ?? "";
	const orgId = activeOrganization?.id ?? "";

	useEffect(() => {
		if (orgSlug && orgId) {
			const storageKey = `workflows:${orgSlug}`;
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				try {
					setWorkflows(JSON.parse(stored));
				} catch (_e) {
					// ignore
				}
			} else {
				const seeds: Workflow[] = [
					{
						id: "wf_mock_welcome",
						name: "Welcome on delivery",
						description: "Send a follow-up when an email is delivered",
						status: "active",
						updatedAt: new Date().toISOString(),
					},
					{
						id: "wf_mock_bounce",
						name: "Bounce alert",
						description: "Notify your team when delivery fails",
						status: "draft",
						updatedAt: new Date().toISOString(),
					},
				];
				localStorage.setItem(storageKey, JSON.stringify(seeds));
				setWorkflows(seeds);
			}
		} else {
			setWorkflows([]);
		}
	}, [orgSlug, orgId]);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<Link
				href={getBackToUrl("/workflows")}
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

			{/* Body */}
			{workflows && workflows.length > 0 ? (
				<div className="-mt-2.5 h-[200px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{workflows.slice(0, 3).map((d) => (
							<div
								key={d.id}
								className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
							>
								<div className="flex min-w-0 flex-col pr-2">
									<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
										{d.name}
									</span>
									<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
										{d.description || "No description"}
									</span>
								</div>
								<div className="flex items-center justify-center">
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
											d.status === "active"
												? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
												: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
										)}
									>
										{d.status}
									</span>
								</div>
								<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
									{new Date(d.updatedAt).toLocaleDateString([], {
										month: "short",
										day: "numeric",
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-2.5 flex h-[200px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{/* Icon outline without pill wrapper */}
					<Icon
						name="workflow"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>

					{/* Heading */}
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Build automations without the overhead
					</h4>

					{/* Description */}
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						From triggers to multi-step AI actions — automate your flows in
						minutes.
					</p>

					{/* Button */}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href={getBackToUrl("/workflows")}>Start building</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
