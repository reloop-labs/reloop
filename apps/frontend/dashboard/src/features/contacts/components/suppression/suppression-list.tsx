"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { type Contact, useContactsQuery } from "../../hooks/use-contacts-query";
import { ContactTableFooter } from "../contacts/table-footer";
import {
	getSuppressionReasonText,
	getSuppressionSource,
} from "./reason-labels";
import { RemoveSuppressionModal } from "./remove-suppression-modal";
import { SuppressionSourceBadge } from "./suppression-source-badge";

const GRID = {
	gridTemplateColumns: "minmax(0,1.2fr) 112px minmax(0,1fr) 120px 92px",
};

export function SuppressionList() {
	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [target, setTarget] = useState<Contact | null>(null);

	const { data, isLoading, isError } = useContactsQuery({
		page,
		limit,
		search,
		status: "",
		suppressed: true,
	});

	const contacts = data?.contacts ?? [];
	const total = data?.total ?? 0;
	const isFiltered = search.trim() !== "";

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 px-4 py-3 dark:border-stroke-soft-100/40">
				<Icon
					name="slash"
					className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600"
				/>
				<p className="text-sm text-text-sub-600">
					Reloop stops sending to an address after it hard-bounces, its mailbox
					is full, or the recipient reports spam. You can also add addresses
					yourself with a reason. Sends to these addresses are rejected with a
					"suppressed" error. Remove an address only if you know it can receive
					email again.
				</p>
			</div>

			<Input.Root size="small" className="w-40 rounded-xl shadow-none! lg:w-56">
				<Input.Wrapper>
					<Input.Icon as={Icon} name="search" size="small" />
					<Input.Input
						placeholder="Search suppressed..."
						value={search}
						aria-label="Search suppressed contacts"
						onChange={(e) => {
							void setSearch(e.target.value || null);
							void setPage(1);
						}}
					/>
				</Input.Wrapper>
			</Input.Root>

			<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
				<div className="w-full min-w-[680px] text-paragraph-sm">
					<div
						style={GRID}
						className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
					>
						<div className="flex items-center gap-1">
							<Icon name="mail-single" className="h-3 w-3" />
							Email
						</div>
						<div className="flex items-center gap-1">
							<Icon name="user" className="h-3 w-3" />
							Source
						</div>
						<div className="flex items-center gap-1">
							<Icon name="alert-circle" className="h-3 w-3" />
							Reason
						</div>
						<div className="flex items-center gap-1">
							<Icon name="history" className="h-3 w-3" />
							Suppressed
						</div>
						<div />
					</div>

					<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
						{isLoading && contacts.length === 0 ? (
							<div className="px-4 py-10 text-center text-sm text-text-sub-600">
								Loading…
							</div>
						) : isError ? (
							<div className="px-4 py-10 text-center text-error-base text-sm">
								Couldn't load suppressed contacts. Refresh to try again.
							</div>
						) : contacts.length === 0 ? (
							<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
								<Icon
									name={isFiltered ? "search" : "check-circle"}
									className="mb-4 h-8 w-8 text-text-sub-600"
								/>
								<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
									{isFiltered ? "No matches" : "No suppressed contacts"}
								</h3>
								<p className="mx-auto max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
									{isFiltered
										? "No suppressed address matches your search."
										: "Every contact can receive email. Addresses that bounce, report spam, or that you add will appear here."}
								</p>
							</div>
						) : (
							contacts.map((contact) => (
								<div
									key={contact.id}
									style={GRID}
									className="grid w-full items-center px-4 py-2 hover:bg-bg-weak-50"
								>
									<Link
										href={`/contacts/detail/${contact.id}`}
										className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-text-sub-600"
									>
										{contact.email}
									</Link>
									<div>
										<SuppressionSourceBadge
											source={getSuppressionSource(contact)}
										/>
									</div>
									<span
										className="truncate pr-3 text-sm text-text-sub-600"
										title={getSuppressionReasonText(contact)}
									>
										{getSuppressionReasonText(contact)}
									</span>
									<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
										{contact.suppressedAt
											? formatRelativeTime(contact.suppressedAt)
											: formatRelativeTime(contact.updatedAt)}
									</span>
									<div className="flex justify-end">
										<Button.Root
											type="button"
											variant="neutral"
											mode="stroke"
											size="xxsmall"
											onClick={() => setTarget(contact)}
										>
											Remove
										</Button.Root>
									</div>
								</div>
							))
						)}

						<ContactTableFooter
							total={total}
							isLoading={isLoading}
							showSelection={false}
						/>
					</div>
				</div>
			</div>

			<RemoveSuppressionModal
				contact={target}
				onOpenChange={(open) => {
					if (!open) setTarget(null);
				}}
			/>
		</div>
	);
}
