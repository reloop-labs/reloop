"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { EmptyState } from "./empty-state";

interface Domain {
	id: string;
	domain: string;
	organizationId: string;
	userId: string;
	domainType: "custom" | "subdomain" | "system";
	status: "start-verify" | "verifying" | "active" | "suspended" | "failed";
	userVerified: boolean;
	systemVerified: boolean;
	dnsConfigured: boolean;
	createdAt: string;
	updatedAt: string;
}

interface DomainListResponse {
	domains: Domain[];
	total: number;
	page: number;
	limit: number;
}

const getStatusColor = (status: Domain["status"]) => {
	switch (status) {
		case "active":
			return "bg-green-500";
		case "verifying":
			return "bg-yellow-500";
		case "start-verify":
			return "bg-blue-500";
		case "suspended":
			return "bg-orange-500";
		case "failed":
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
};

const getStatusLabel = (status: Domain["status"]) => {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "start-verify":
			return "Setup Required";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
	}
};

export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const { domainId } = useParams();

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	return (
		<div>
			<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b px-2">
				<div className="flex items-center gap-2">
					<div className="font-medium text-sm text-text-sub-600">
						{isLoading
							? "Loading..."
							: data?.domains
								? `${data.domains.length} Domain${data.domains.length !== 1 ? "s" : ""}`
								: "Domains"}
					</div>
				</div>
				<Link
					className={Button.buttonVariants({
						variant: "neutral",
						size: "xsmall",
					}).root()}
					href={`/${activeOrganization.slug}/domain/add`}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
				</Link>
			</div>
			<div>
				{isLoading ? (
					<div className="flex h-32 items-center justify-center">
						<Spinner />
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load domains
						</p>
					</div>
				) : !data?.domains || data.domains.length === 0 ? (
					<EmptyState />
				) : (
					<div className="divide-y divide-stroke-soft-100">
						{data.domains.map((domain) => (
							<Link
								key={domain.id}
								href={`/${activeOrganization.slug}/domain/${domain.domain}`}
								className={`flex items-center justify-between px-3 py-3 transition-colors hover:bg-bg-weak-50 ${
									domainId === domain.domain
										? "border-l-2 border-l-blue-500 bg-bg-weak-50"
										: ""
								}`}
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<div
										className={`h-2 w-2 flex-shrink-0 rounded-full ${getStatusColor(domain.status)}`}
										title={getStatusLabel(domain.status)}
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-text-strong-950">
											{domain.domain}
										</p>
										<p className="text-text-sub-600 text-xs">
											{getStatusLabel(domain.status)}
										</p>
									</div>
								</div>
								<Icon
									name="chevron-right"
									className="h-4 w-4 flex-shrink-0 text-text-sub-600"
								/>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
