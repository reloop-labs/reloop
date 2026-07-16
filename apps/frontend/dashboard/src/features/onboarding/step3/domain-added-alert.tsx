import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

export function DomainAddedAlert({ domainName }: { domainName?: string }) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 px-4 py-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
			<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-base/15">
				<Icon name="checkbox-circle" className="size-4 text-success-base" />
			</div>
			<div className="min-w-0">
				{domainName ? (
					<p className="mb-0.5 truncate font-semibold text-paragraph-sm text-text-strong-950">
						{domainName}
					</p>
				) : (
					<Skeleton className="mb-1 h-4 w-40 rounded" />
				)}
				<p className="text-paragraph-xs text-text-sub-600">
					Domain added · Copy the records below and add them to your DNS
					provider to start sending emails.
				</p>
			</div>
		</div>
	);
}
