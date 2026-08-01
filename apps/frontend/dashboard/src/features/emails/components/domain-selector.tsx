import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type { DomainListResponse } from "#/features/domain/types";
import { queryKeys } from "#/lib/query-keys";

interface DomainSelectorProps {
	value: string;
	onChange: (value: string) => void;
	align?: "start" | "end";
}

export const DomainSelector = ({ value, onChange }: DomainSelectorProps) => {
	const { activeOrganization } = useActiveOrganization();

	const { data, isPending: isLoading } = useQuery({
		queryKey: [...queryKeys.domain.list(), "selector", activeOrganization?.id],
		queryFn: async () => {
			const res = await fetch(
				`/api/domain/v1/list?organizationId=${activeOrganization?.id}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load domains");
			return res.json() as Promise<DomainListResponse>;
		},
		enabled: !!activeOrganization?.id,
	});

	const domains = data?.domains || [];
	const displayLabel = value || "All Domains";

	return (
		<Select
			value={value === "" ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
		>
			<SelectTrigger className="w-44">
				<SelectValue placeholder="All Domains">
					<Icon name="globe" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">{displayLabel}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-44">
				<SelectItem value="all">
					<Icon name="globe" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">All Domains</span>
				</SelectItem>
				{isLoading ? (
					<div className="space-y-1 p-1">
						<Skeleton className="h-8 w-full rounded-lg" />
						<Skeleton className="h-8 w-full rounded-lg" />
					</div>
				) : domains.length === 0 ? (
					<div className="px-2.5 py-3 text-center text-text-sub-600 text-xs">
						No domains found
					</div>
				) : (
					domains.map((domain) => (
						<SelectItem key={domain.id} value={domain.domain}>
							<Icon
								name="globe"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<span className="min-w-0 truncate">{domain.domain}</span>
						</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	);
};
