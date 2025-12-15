"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import * as StatusBadge from "@reloop/ui/status-badge";
import * as Table from "@reloop/ui/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";
import { AddNewMailboxModal } from "./add-new-modal";
import { Mail } from "./mail";

dayjs.extend(relativeTime);

const mailboxes: Array<{
	id: string;
	email: string;
	password: string;
	quota: string;
	status: string;
	createdAt: string;
}> = [
		{
			id: "1",
			email: "admin@example.com",
			password: "••••••••••",
			quota: "5 GB",
			status: "active",
			createdAt: dayjs().subtract(2, "days").toISOString(),
		},
		{
			id: "2",
			email: "support@example.com",
			password: "••••••••••",
			quota: "10 GB",
			status: "active",
			createdAt: dayjs().subtract(1, "week").toISOString(),
		},
		{
			id: "3",
			email: "sales@examp le.com",
			password: "••••••••••",
			quota: "2 GB",
			status: "disabled",
			createdAt: dayjs().subtract(3, "weeks").toISOString(),
		},
	];

const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-stroke-soft-100 p-6 py-20">
			<div className="mb-6 rounded-full bg-warning-light p-1">
				<Mail
					className="h-24 w-24 rounded-full"
					iconClassName="text-warning-dark w-12 h-12"
				/>
			</div>
			<h3 className="mb-2 font-medium text-title-h5">No mailboxes yet</h3>
			<p className="mb-6 max-w-sm text-center text-paragraph-sm text-text-sub-600">
				Get started by adding your first mailbox to begin receiving and managing
				emails for your domain.
			</p>
			<Link
				className={Button.buttonVariants({
					variant: "neutral",
				}).root()}
				href={`/${activeOrganization.slug}/domain/add`}
			>
				<Icon name="plus" className="h-4 w-4" />
				Add your first mailbox
			</Link>
		</div>
	);
};

const MailboxesPage = () => {
	const { activeOrganization } = useUserOrganization();
	const [open, setState] = useState(false);
	return (
		<div className="mb-28">
			<div className="border-stroke-soft-100 border-b">
				<div className="mx-auto flex max-w-3xl items-center justify-between">
					<div className="flex items-center gap-4 py-10">
						<div>
							<h1 className="font-medium text-title-h4">Mailboxes</h1>
						</div>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						onClick={() => setState(true)}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add Mailbox
					</Button.Root>
				</div>
			</div>
			<div className="mx-auto max-w-3xl py-10">
				{mailboxes.length === 0 ? (
					<EmptyState />
				) : (
					<Table.Root className="rounded-lg border border-stroke-soft-100 pb-2!">
						<Table.Header>
							<Table.Row>
								<Table.Head className="h-11 font-medium text-sm first:rounded-none">
									Email Address
								</Table.Head>
								<Table.Head className="h-11 font-medium text-sm">
									Password
								</Table.Head>
								<Table.Head className="h-11 font-medium text-sm">
									Quota
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
							{mailboxes.map((mailbox, index) => (
								<React.Fragment key={mailbox.id}>
									<Table.Row className="[&>td]:group-hover/row:bg-transparent">
										<Table.Cell className="h-10">
											<div className="flex items-center gap-2">
												<Icon
													name="mail-single"
													className="h-4 w-4 text-text-sub-600"
												/>
												<span className="text-label-sm text-text-strong-950">
													{mailbox.email}
												</span>
											</div>
										</Table.Cell>
										<Table.Cell className="h-10">
											<div className="flex items-center gap-2">
												<span className="font-mono text-label-sm text-text-sub-600">
													{mailbox.password}
												</span>
												<button
													type="button"
													className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-bg-weak-50"
													title="Copy password"
												>
													<Icon
														name="clipboard-copy"
														className="h-3 w-3 text-text-sub-600"
													/>
												</button>
											</div>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{mailbox.quota}
											</span>
										</Table.Cell>
										<Table.Cell className="h-10">
											<StatusBadge.Root
												status={
													mailbox.status === "active" ? "completed" : "disabled"
												}
											>
												<StatusBadge.Icon
													as={Icon}
													name={
														(mailbox.status === "active" &&
															"checkbox-circle") ||
														(mailbox.status === "disabled" && "slash") ||
														"check-circle"
													}
													className="h-3 w-3"
												/>
												{mailbox.status}
											</StatusBadge.Root>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{dayjs(mailbox.createdAt).fromNow()}
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
														<button
															type="button"
															className="flex items-center gap-2 rounded-lg p-2 text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
														>
															<Icon name="external-link" className="h-4 w-4" />
															View Mailbox
														</button>
														<button
															type="button"
															className="flex items-center gap-2 rounded-lg p-2 text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
														>
															<Icon name="key-new" className="h-4 w-4" />
															Reset Password
														</button>
														<button
															type="button"
															className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-paragraph-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-600"
														>
															<Icon name="trash" className="h-4 w-4" />
															Delete Mailbox
														</button>
													</div>
												</Popover.Content>
											</Popover.Root>
										</Table.Cell>
									</Table.Row>
									{index < mailboxes.length - 1 && (
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
			<AddNewMailboxModal open={open} setState={setState} />
		</div>
	);
};

export default MailboxesPage;
