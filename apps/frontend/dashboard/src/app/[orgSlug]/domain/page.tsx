"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Popover from "@reloop/ui/components/popover";
import * as StatusBadge from "@reloop/ui/components/status-badge";
import * as Table from "@reloop/ui/components/table";
import { cn } from "@ui/utils/cn";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import * as React from "react";

// Initialize dayjs with relative time plugin
dayjs.extend(relativeTime);

import { Globe } from "./globe";

// Sample domain data - set to empty array to see empty state
const domains: Array<{
	id: string;
	name: string;
	status: string;
	createdAt: string;
}> = [
	{
		id: "1",
		name: "example.com",
		status: "disabled",
		createdAt: dayjs().subtract(5, "hours").toISOString(),
	},
	{
		id: "2",
		name: "test.example.com",
		status: "pending",
		createdAt: dayjs().subtract(2, "days").toISOString(),
	},
	{
		id: "3",
		name: "mail.example.com",
		status: "failed",
		createdAt: dayjs().subtract(1, "week").toISOString(),
	},
	{
		id: "4",
		name: "api.example.com",
		status: "completed",
		createdAt: dayjs().subtract(30, "minutes").toISOString(),
	},
];

const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-stroke-soft-100 p-6 py-20">
			<div className="mb-6 rounded-full bg-verified-light p-1">
				<Globe
					className="h-24 w-24 rounded-full"
					iconClassName="text-verified-dark w-12 h-12"
				/>
			</div>
			<h3 className="mb-2 font-medium text-title-h5">No domains yet</h3>
			<p className="mb-6 max-w-sm text-center text-paragraph-sm text-text-sub-600">
				Get started by adding your first domain to begin sending emails from
				your custom domain.
			</p>
			<Link
				className={Button.buttonVariants({
					variant: "neutral",
				}).root()}
				href={`/${activeOrganization.slug}/domain/add`}
			>
				<Icon name="plus" className="h-4 w-4" />
				Add your first domain
			</Link>
		</div>
	);
};

const DomainPage = () => {
	const { activeOrganization } = useUserOrganization();

	// Empty state component

	return (
		<div className="mb-28">
			<div className="border-stroke-soft-100 border-b">
				<div className="mx-auto flex max-w-3xl items-center justify-between">
					<div className="flex items-center gap-4 py-10">
						<div>
							<h1 className="font-medium text-title-h4 ">Domain</h1>
						</div>
					</div>
					<Link
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()}
						href={`/${activeOrganization.slug}/domain/add`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
				</div>
			</div>
			<div className="mx-auto max-w-3xl py-10">
				{domains.length === 0 ? (
					<EmptyState />
				) : (
					<Table.Root className="rounded-lg border border-stroke-soft-100 pb-2!">
						<Table.Header>
							<Table.Row>
								<Table.Head className="h-11 font-medium text-sm first:rounded-none">
									Domain
								</Table.Head>
								<Table.Head className="h-11 font-medium text-sm">
									Status
								</Table.Head>
								<Table.Head className="h-11 font-medium text-sm">
									Created At
								</Table.Head>
								<Table.Head className="h-11 w-12 last:rounded-none" />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{domains.map((domain, index) => (
								<React.Fragment key={domain.id}>
									<Table.Row className="[&>td]:group-hover/row:bg-transparent">
										<Table.Cell className="h-10">
											<Link
												href={`/${activeOrganization.slug}/domain/${domain.id}`}
												className="flex items-center gap-2 transition-colors hover:text-blue-600"
											>
												<Icon
													name="globe"
													className="h-4 w-4 text-text-sub-600"
												/>
												<span className="text-label-sm text-text-strong-950">
													{domain.name}
												</span>
											</Link>
										</Table.Cell>
										<Table.Cell className="h-10">
											<StatusBadge.Root
												status={domain.status as any}
												className="font-medium text-sm"
												variant="light"
											>
												<StatusBadge.Icon
													as={Icon}
													name={
														(domain.status === "disabled" && "slash") ||
														(domain.status === "pending" && "info-outline") ||
														(domain.status === "completed" &&
															"checkbox-circle") ||
														(domain.status === "failed" && "plus-outline") ||
														"check-circle"
													}
													className={cn(
														"h-3 w-3",
														domain.status === "failed" && "rotate-45",
													)}
												/>
												{domain.status}
											</StatusBadge.Root>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{dayjs(domain.createdAt).fromNow()}
											</span>
										</Table.Cell>
										<Table.Cell className="h-10">
											<Popover.Root>
												<Popover.Trigger asChild>
													<button
														type="button"
														className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-bg-weak-50"
													>
														<Icon
															name="more-vertical"
															className="h-4 w-4 text-text-sub-600"
														/>
													</button>
												</Popover.Trigger>
												<Popover.Content
													align="end"
													sideOffset={1}
													className="w-[200px] p-2"
												>
													<div className="flex flex-col">
														<Link
															href={`/${activeOrganization.slug}/domain/${domain.id}`}
															className="flex items-center gap-2 rounded-lg p-2 text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
														>
															<Icon name="eye-outline" className="h-4 w-4" />
															View DNS Records
														</Link>
														<button
															type="button"
															className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-paragraph-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-600"
														>
															<Icon name="trash" className="h-4 w-4" />
															Remove Domain
														</button>
													</div>
												</Popover.Content>
											</Popover.Root>
										</Table.Cell>
									</Table.Row>
									{index < domains.length - 1 && (
										<tr aria-hidden="true">
											<td colSpan={999} className="py-1.5">
												<div className="h-px bg-stroke-soft-200" />
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</Table.Body>
					</Table.Root>
				)}
			</div>
		</div>
	);
};

export default DomainPage;
