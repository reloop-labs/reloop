"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
}

interface LogListResponse {
	logs: LogData[];
	count: number;
}

export function AuditLogsCard() {
	const { activeOrganization } = useUserOrganization();

	const { data: auditLogsData } = useSWR<LogListResponse>(
		activeOrganization?.id ? "/api/logs/v1/list?limit=5" : null,
	);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<Link
				href="/logs"
				className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-5 dark:border-white/5 dark:bg-white/[0.02]"
			>
				<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
					<Icon
						name="file-text"
						className="h-4 w-4 text-text-sub-600 dark:text-white/60"
					/>
					Audit Logs
				</span>
				<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
			</Link>

			{/* Body */}
			{auditLogsData?.logs && auditLogsData.logs.length > 0 ? (
				<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{auditLogsData.logs.slice(0, 3).map((d) => (
							<div
								key={d.uuid}
								className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
							>
								<div className="flex min-w-0 flex-col pr-2">
									<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
										{d.event}
									</span>
									<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
										{d.uuid}
									</span>
								</div>
								<div className="flex items-center justify-center">
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
											d.level === "error" ||
												(d.status_code && d.status_code >= 400)
												? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
												: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
										)}
									>
										{d.level || "info"}
									</span>
								</div>
								<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
									{new Date(d.created_at).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-2.5 flex min-h-[175px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{/* Icon outline without pill wrapper */}
					<Icon
						name="file-text"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>

					{/* Heading */}
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Track activity without the overhead
					</h4>

					{/* Description */}
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						Track security events, API key access, and team actions.
					</p>

					{/* Button */}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/logs">View audit logs</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
