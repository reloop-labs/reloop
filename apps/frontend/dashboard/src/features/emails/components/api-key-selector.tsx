import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface ApiKeyData {
	id: string;
	name: string | null;
	prefix: string | null;
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
}

interface ApiKeySelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const ApiKeySelector = ({ value, onChange }: ApiKeySelectorProps) => {
	const { activeOrganization } = useActiveOrganization();

	const { data, isPending: isLoading } = useQuery({
		queryKey: [...queryKeys.apiKeys.all, "selector"],
		queryFn: async () => {
			const res = await fetch("/api/api-key/v1/", { credentials: "include" });
			if (!res.ok) throw new Error("Failed to load API keys");
			return res.json() as Promise<ApiKeyListResponse>;
		},
		enabled: !!activeOrganization?.id,
	});

	const apiKeys = data?.apiKeys || [];
	const selectedKey = apiKeys.find((k) => k.id === value);
	const displayLabel = selectedKey
		? selectedKey.name || selectedKey.prefix || "API Key"
		: "All API Keys";

	return (
		<Select
			value={value === "" ? "all" : value}
			onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
		>
			<SelectTrigger className="w-44">
				<SelectValue placeholder="All API Keys">
					<Icon name="key-new" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">{displayLabel}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-44">
				<SelectItem value="all">
					<Icon name="key-new" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">All API Keys</span>
				</SelectItem>
				{isLoading ? (
					<div className="space-y-1 p-1">
						<Skeleton className="h-8 w-full rounded-lg" />
						<Skeleton className="h-8 w-full rounded-lg" />
					</div>
				) : apiKeys.length === 0 ? (
					<div className="px-2.5 py-3 text-center text-text-sub-600 text-xs">
						No API keys found
					</div>
				) : (
					apiKeys.map((key) => (
						<SelectItem key={key.id} value={key.id}>
							<Icon
								name="key-new"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<span className="min-w-0 truncate">
								{key.name || key.prefix || "Unnamed Key"}
							</span>
						</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	);
};
