import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as StatusBadge from "@reloop/ui/status-badge";
import Link from "next/link";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import type { DomainStatus } from "#/features/domain/types";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "#/features/domain/utils";
import { HomeCardBody, HomeCardHeader, HomeCardShell } from "./home-card-shell";

function statusBadgeStatus(
	status: DomainStatus,
): "completed" | "pending" | "failed" | "disabled" {
	switch (status) {
		case "active":
			return "completed";
		case "pending":
		case "verifying":
			return "pending";
		case "failed":
		case "suspended":
			return "failed";
		default:
			return "disabled";
	}
}

export function DomainsSummaryCard({ enabled }: { enabled: boolean }) {
	const { data, isPending } = useDomainsQuery({
		page: 1,
		limit: 5,
		status: "",
		q: "",
		enabled,
	});

	const domains = data?.domains ?? [];
	const total = data?.total ?? 0;

	return (
		<HomeCardShell
			className="h-full"
			header={
				<HomeCardHeader>
					<div className="flex items-center gap-2">
						<Icon name="globe" className="h-4 w-4 text-text-sub-600" />
						<h2 className="font-medium text-label-md text-text-strong-950">
							Domains
						</h2>
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-white-0 px-1.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
							{total}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Link
							href="/domain/add"
							className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
							aria-label="Add domain"
						>
							<Icon name="plus" className="h-3.5 w-3.5" />
						</Link>
						<Link
							href="/domain"
							className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							View all
							<Icon name="arrow-right" className="h-3.5 w-3.5" />
						</Link>
					</div>
				</HomeCardHeader>
			}
		>
			<HomeCardBody className="min-h-[220px]">
				{isPending ? (
					<div className="space-y-0 px-5 py-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-stroke-soft-100/40"
							>
								<div className="flex items-center gap-2.5">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-5 w-16 rounded-md" />
							</div>
						))}
					</div>
				) : domains.length > 0 ? (
					<ul className="px-5">
						{domains.slice(0, 5).map((domain) => (
							<li key={domain.id}>
								<Link
									href={`/domain/${domain.id}`}
									className="group flex items-center justify-between gap-3 border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-stroke-soft-100/40"
								>
									<div className="flex min-w-0 items-center gap-2.5">
										<Icon
											name={getStatusIcon(domain.status)}
											className={cn(
												"h-4 w-4 shrink-0",
												getStatusColorClass(domain.status),
											)}
										/>
										<span className="truncate font-medium text-paragraph-sm text-text-strong-950 group-hover:underline">
											{domain.domain}
										</span>
									</div>
									<StatusBadge.Root
										variant="light"
										status={statusBadgeStatus(domain.status)}
									>
										<StatusBadge.Dot />
										{getStatusLabel(domain.status)}
									</StatusBadge.Root>
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
						<Icon name="globe" className="h-6 w-6 text-text-soft-400" />
						<h3 className="mt-4 font-semibold text-label-md text-text-strong-950">
							No domains yet
						</h3>
						<p className="mt-1.5 max-w-[260px] text-paragraph-sm text-text-sub-600">
							Add a domain to authenticate mail and protect deliverability.
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							asChild
							className="mt-5 rounded-xl"
						>
							<Link href="/domain/add">Add domain</Link>
						</Button.Root>
					</div>
				)}
			</HomeCardBody>
		</HomeCardShell>
	);
}
