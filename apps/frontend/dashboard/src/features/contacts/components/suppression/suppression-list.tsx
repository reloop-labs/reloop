"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
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
	gridTemplateColumns: "minmax(180px,1.2fr) 112px minmax(140px,1fr) 120px 92px",
};

export function SuppressionList() {
	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [modalId, setModalId] = useQueryState("id", { history: "replace" });

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

	// Derived from the loaded page; stays closed until the row is available.
	// Once removed, the row drops out of the list and the modal closes itself.
	const target =
		modal === "remove-suppression" && modalId
			? (contacts.find((c) => c.id === modalId) ?? null)
			: null;
	const setTarget = (contact: Contact | null) => {
		void setModal(contact ? "remove-suppression" : null);
		void setModalId(contact ? contact.id : null);
	};

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

			<Input.Root
				size="small"
				className="w-full rounded-xl shadow-none! sm:w-40 lg:w-56"
			>
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

			{/* Phones and tablets: the card (border drawn here) holds a sideways
			    scroller for the columns, and the footer below it stays put */}
			<div className="w-full text-paragraph-sm max-md:overflow-hidden max-md:rounded-[14px] max-md:border max-md:border-stroke-soft-100 dark:max-md:border-stroke-soft-100/70">
				<div className="w-full overflow-x-auto">
					{/* 680px = the column minimums, so the Remove column never spills out */}
					<div className="min-w-[680px]">
						<div
							style={GRID}
							className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs max-md:rounded-none max-md:border-0 max-md:pb-2.5 dark:border-[#101010] dark:bg-bg-weak-50/40"
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

						<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 max-md:mt-0 max-md:rounded-none max-md:border-0 max-md:border-t dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40 [&>*:first-child]:rounded-t-[11px] max-md:[&>*:first-child]:rounded-none">
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

							{/* Desktop: footer inside the rows card, as before */}
							<div className="max-md:hidden">
								<ContactTableFooter
									total={total}
									isLoading={isLoading}
									showSelection={false}
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Phones/tablets: outside the scroller, so it never scrolls sideways. No top
				    border: divide-y already draws one under the last row (the hidden desktop
				    footer above is still the last child). */}
				<div className="bg-bg-white-0 md:hidden dark:bg-black">
					<ContactTableFooter
						total={total}
						isLoading={isLoading}
						showSelection={false}
					/>
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
