"use client";

import {
	EmptyState,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatBytes,
	formatRecipients,
	formatRelativeTime,
} from "@fe/console/lib/format";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import useSWR from "swr";

type EmailItem = {
	id: string;
	organizationId: string;
	fromEmail: string;
	toEmails: string[] | unknown;
	subject: string;
	status: string;
	createdAt: string;
	sentAt: string | null;
	attachments?: Array<{
		id: string;
		filename: string;
		contentType: string;
		size: number;
		storagePath?: string;
	}>;
};

type EmailsResponse = { items: EmailItem[]; total: number };

const emailGridStyle = {
	gridTemplateColumns:
		"100px minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1.5fr) minmax(96px, 0.7fr) 110px 72px",
};

const AVATAR_GRADIENTS = [
	"from-rose-500 to-pink-600",
	"from-orange-500 to-red-600",
	"from-amber-500 to-orange-600",
	"from-emerald-500 to-green-600",
	"from-teal-500 to-emerald-600",
	"from-cyan-500 to-teal-600",
	"from-sky-500 to-blue-600",
	"from-indigo-500 to-blue-600",
	"from-violet-500 to-purple-600",
	"from-fuchsia-500 to-purple-600",
	"from-slate-500 to-gray-600",
] as const;

function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return Math.abs(hash);
}

function getAvatarGradient(seed: string): string {
	const index = hashString(seed) % AVATAR_GRADIENTS.length;
	return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

function getAvatarInitial(email: string): string {
	const prefix = email.split("@")[0];
	return prefix ? prefix.charAt(0).toUpperCase() : "?";
}

function getEmailStatusColorClass(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		case "opened":
			return "text-information-base";
		case "clicked":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
}

function getEmailStatusIcon(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
			return "clock";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		default:
			return "mail-single";
	}
}

function getEmailStatusLabel(status: string): string {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
}

const COLUMN_HEADERS = [
	{ id: "when", label: "When", icon: "clock" },
	{ id: "from", label: "From", icon: "send-2" },
	{ id: "to", label: "To", icon: "user" },
	{ id: "subject", label: "Subject", icon: "file-text" },
	{ id: "attachments", label: "Attachments", icon: "paperclip" },
	{ id: "status", label: "Status", icon: "check-circle" },
	{ id: "org", label: "Org", icon: "layout-grid" },
] as const;

function EmailTableSkeleton() {
	return (
		<div style={emailGridStyle} className="grid items-center px-4 py-2.5">
			<div className="h-4 w-16 rounded bg-bg-weak-50" />
			<div className="h-4 w-28 rounded bg-bg-weak-50" />
			<div className="flex items-center gap-2">
				<div className="h-5 w-5 rounded-full bg-bg-weak-50" />
				<div className="h-4 w-32 rounded bg-bg-weak-50" />
			</div>
			<div className="h-4 w-40 rounded bg-bg-weak-50" />
			<div className="h-4 w-10 rounded bg-bg-weak-50" />
			<div className="flex items-center gap-2">
				<div className="h-3.5 w-3.5 rounded-full bg-bg-weak-50" />
				<div className="h-4 w-16 rounded bg-bg-weak-50" />
			</div>
			<div className="h-4 w-12 rounded bg-bg-weak-50" />
		</div>
	);
}

function AttachmentCell({
	attachments,
}: {
	attachments?: EmailItem["attachments"];
}) {
	if (!attachments || attachments.length === 0) {
		return <span className="text-[13px] text-text-soft-400">—</span>;
	}

	const first = attachments[0];
	const label =
		attachments.length === 1
			? first?.filename || "1 file"
			: `${attachments.length} files`;
	const title = attachments
		.map((a) =>
			[a.filename, a.size != null ? formatBytes(a.size) : null]
				.filter(Boolean)
				.join(" · "),
		)
		.join("\n");

	return (
		<div
			className="flex min-w-0 items-center gap-1.5 text-text-sub-600"
			title={title}
		>
			<Icon
				name="paperclip"
				className="h-3.5 w-3.5 shrink-0 text-text-soft-400"
			/>
			<span className="truncate font-medium text-[13px]">{label}</span>
		</div>
	);
}

export default function EmailsPage() {
	const router = useRouter();
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [organizationId, setOrganizationId] = useQueryState(
		"organizationId",
		parseAsString.withDefault(""),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);
	const [draftQ, setDraftQ] = useState(q);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const offset = Math.max(0, (page - 1) * limit);

	const { data, isLoading } = useSWR<EmailsResponse>(
		["/emails", q, status, organizationId, page, limit],
		() =>
			adminGet<EmailsResponse>("/emails", {
				q: q || undefined,
				status: status || undefined,
				organizationId: organizationId || undefined,
				limit,
				offset,
			}),
	);

	useEffect(() => {
		if (data?.total !== undefined && data.total > 0) {
			const totalPages = Math.ceil(data.total / limit);
			if (page > totalPages) {
				setPage(totalPages);
			}
		}
	}, [data?.total, limit, page, setPage]);

	const items = data?.items ?? [];

	return (
		<PageFrame>
			<PageHeading
				title="Emails"
				description="Every email sent across the platform. Received inbound mail is under Received."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} matching
						{status ? ` · ${status}` : ""}
					</span>
				}
				actions={
					<form
						className="flex flex-wrap gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setPage(1);
							setQ(draftQ.trim() || null);
						}}
					>
						<Input.Root className="w-56">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search from / subject / to"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={status}
							onChange={(e) => {
								setPage(1);
								setStatus(e.target.value || null);
							}}
						>
							<option value="">All statuses</option>
							<option value="bounced">Bounced</option>
							<option value="failed">Failed</option>
							<option value="spam">Spam</option>
							<option value="sent">Sent</option>
							<option value="delivered">Delivered</option>
							<option value="pending">Pending</option>
						</select>
						{organizationId ? (
							<>
								<Button.Root asChild variant="neutral" mode="stroke">
									<Link href={`/organizations/${organizationId}`}>Org hub</Link>
								</Button.Root>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									onClick={() => {
										setPage(1);
										setOrganizationId(null);
									}}
								>
									Clear org
								</Button.Root>
							</>
						) : null}
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{organizationId ? (
				<p className="rounded-xl bg-bg-weak-50 px-3 py-2 text-[12px] text-text-sub-600 dark:bg-white/[0.04]">
					Filtered to organization{" "}
					<code className="font-mono text-[11px]">{organizationId}</code>
				</p>
			) : null}

			<div className="w-full text-paragraph-sm">
				<div
					style={emailGridStyle}
					className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
				>
					{COLUMN_HEADERS.map((col) => (
						<div key={col.id} className="flex min-w-0 items-center gap-1">
							<Icon name={col.icon} className="h-3 w-3 shrink-0" />
							<span className="truncate text-xs">{col.label}</span>
						</div>
					))}
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && items.length === 0 ? (
						Array.from({ length: 6 }).map((_, index) => (
							<EmailTableSkeleton key={`skeleton-${index}`} />
						))
					) : items.length === 0 ? (
						<EmptyState title="Nothing here yet" />
					) : (
						items.map((email) => {
							const toLabel = formatRecipients(email.toEmails);
							const primaryTo =
								Array.isArray(email.toEmails) &&
								typeof email.toEmails[0] === "string"
									? email.toEmails[0]
									: toLabel;

							return (
								<div
									key={email.id}
									style={emailGridStyle}
									className={cn(
										"group/row grid w-full cursor-pointer items-center px-4 py-2.5 text-left",
										"hover:bg-bg-weak-50",
									)}
									onClick={() => router.push(`/emails/${email.id}`)}
								>
									<div className="flex items-center">
										<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
											{formatRelativeTime(email.createdAt)}
										</span>
									</div>

									<div className="min-w-0 pr-3">
										<span
											className="block truncate font-medium text-[13px] text-text-strong-950"
											title={email.fromEmail}
										>
											{email.fromEmail}
										</span>
									</div>

									<div className="flex min-w-0 items-center gap-2 pr-3">
										<Avatar.Root size="20" color="gray" className="shrink-0">
											<Avatar.Image asChild>
												<div
													className={cn(
														"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
														getAvatarGradient(primaryTo),
													)}
												>
													{getAvatarInitial(primaryTo)}
												</div>
											</Avatar.Image>
										</Avatar.Root>
										<span
											className="truncate font-medium text-[13px] text-text-strong-950"
											title={toLabel}
										>
											{toLabel}
										</span>
									</div>

									<div className="min-w-0 pr-3">
										<span
											className="block truncate font-medium text-[13px] text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors group-hover/row:text-[#1868DF] dark:group-hover/row:text-blue-400"
											title={email.subject || "(no subject)"}
										>
											{email.subject || "(no subject)"}
										</span>
									</div>

									<div className="min-w-0 pr-2">
										<AttachmentCell attachments={email.attachments} />
									</div>

									<div className="flex items-center">
										<div
											className={cn(
												"flex items-center gap-1.5 font-medium text-[13px]",
												getEmailStatusColorClass(email.status),
											)}
										>
											<Icon
												name={getEmailStatusIcon(email.status)}
												className="h-3.5 w-3.5 shrink-0"
											/>
											<span className="truncate">
												{getEmailStatusLabel(email.status)}
											</span>
										</div>
									</div>

									<div
										className="flex items-center"
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => e.stopPropagation()}
									>
										<Link
											href={`/organizations/${email.organizationId}`}
											className="truncate font-medium text-[13px] text-text-sub-600 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
										>
											Open hub
										</Link>
									</div>
								</div>
							);
						})
					)}

					<TablePagination
						total={data?.total ?? 0}
						page={page}
						limit={limit}
						onPageChange={(p) => setPage(p)}
						onLimitChange={(l) => {
							setLimit(l);
							setPage(1);
						}}
						isLoading={isLoading}
						itemName="emails"
						className="rounded-b-xl border-t-0"
					/>
				</div>
			</div>
		</PageFrame>
	);
}
