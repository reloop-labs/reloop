"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Select from "@reloop/ui/select";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { DeleteDomainModal } from "../delete-domain";
import { DomainTable } from "./domain-table";
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

export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const { domainId } = useParams();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	// Filter domains based on status and search query
	const filteredDomains =
		data?.domains?.filter((domain) => {
			const matchesStatus =
				statusFilter === "all" || domain.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				domain.domain.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	return (
		<div className="mx-auto max-w-3xl">
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">
					Domain{data?.domains.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
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
					<Button.Root variant="neutral" size="xsmall" mode="stroke">
						<Icon name="code" className="h-4 w-4" />
						API <Kbd.Root>P</Kbd.Root>
					</Button.Root>
				</div>
			</div>
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load domains
						</p>
					</div>
				) : !data?.domains || data.domains.length === 0 ? (
					<EmptyState />
				) : (
					<div>
						<div className="mt-10 flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search domains..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-40">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="Status" />
									</Select.Trigger>
									<Select.Content className="w-40">
										<Select.Item value="all">All Status</Select.Item>
										<Select.Item value="start-verify">Start Verify</Select.Item>
										<Select.Item value="verifying">Verifying</Select.Item>
										<Select.Item value="active">Active</Select.Item>
										<Select.Item value="suspended">Suspended</Select.Item>
										<Select.Item value="failed">Failed</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
						<div className="mt-4">
							<DomainTable
								domains={filteredDomains}
								activeOrganizationSlug={activeOrganization.slug}
								currentDomainId={domainId as string}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>
					</div>
				)}
			</div>
			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
};
