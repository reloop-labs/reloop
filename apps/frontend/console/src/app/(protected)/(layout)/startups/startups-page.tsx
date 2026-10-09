"use client";

import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import {
	adminErrorMessage,
	adminGet,
	adminPatch,
} from "@fe/console/lib/admin-api";
import { formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type StartupStatus = "pending" | "approved" | "rejected" | "contacted";

type StartupItem = {
	id: string;
	email: string;
	fullName: string;
	company: string;
	website: string | null;
	role: string | null;
	monthlyVolume: string | null;
	useCase: string;
	status: StartupStatus;
	reviewedAt: string | null;
	reviewNote: string | null;
	createdAt: string;
	updatedAt: string;
};

type StartupsResponse = { items: StartupItem[]; total: number };

const STATUS_TONE: Record<StartupStatus, "gray" | "green" | "red" | "blue"> = {
	pending: "gray",
	approved: "green",
	rejected: "red",
	contacted: "blue",
};

export default function StartupsPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);
	const [draftQ, setDraftQ] = useState(q);
	const [selected, setSelected] = useState<StartupItem | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const [saving, setSaving] = useState(false);

	const offset = Math.max(0, (page - 1) * limit);

	const { data, isLoading, mutate } = useSWR<StartupsResponse>(
		["/startup-applications", q, status, page, limit],
		() =>
			adminGet<StartupsResponse>("/startup-applications", {
				q: q || undefined,
				status: status || undefined,
				limit,
				offset,
			}),
	);

	async function setReview(target: StartupItem, next: StartupStatus) {
		setSaving(true);
		try {
			await adminPatch(`/startup-applications/${target.id}`, {
				status: next,
				reviewNote: reviewNote.trim() || undefined,
			});
			toast.success(`Application ${next}`);
			setSelected(null);
			setReviewNote("");
			mutate();
		} catch (error) {
			toast.error(adminErrorMessage(error));
		} finally {
			setSaving(false);
		}
	}

	return (
		<PageFrame>
			<PageHeading
				title="Startups"
				description="Review $1,000 credit applications from /startups. Approve, contact, or reject — no signup required from applicants."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} total
					</span>
				}
				actions={
					<form
						className="flex flex-wrap items-center gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setPage(1);
							setQ(draftQ.trim() || null);
						}}
					>
						<Input.Root className="w-56 sm:w-64">
							<Input.Wrapper>
								<Input.Icon as={Search} className="size-4 text-text-soft-400" />
								<Input.Input
									placeholder="Search email, company, name"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
								{draftQ ? (
									<button
										type="button"
										onClick={() => {
											setDraftQ("");
											setQ(null);
											setPage(1);
										}}
										className="text-text-soft-400 transition-colors hover:text-text-strong-950"
										title="Clear search"
									>
										<X className="size-3.5" />
									</button>
								) : null}
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 font-medium text-[12px] text-text-sub-600 outline-none transition-colors hover:border-stroke-sub-300 dark:border-white/10 dark:bg-transparent"
							value={status}
							onChange={(e) => {
								setStatus(e.target.value || null);
								setPage(1);
							}}
						>
							<option value="">All statuses</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="contacted">Contacted</option>
							<option value="rejected">Rejected</option>
						</select>
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={[
						"Applicant",
						"Company",
						"Volume",
						"Status",
						"Applied",
						"Actions",
					]}
					colSpan={6}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
				>
					{data?.items.map((item) => (
						<tr
							key={item.id}
							className="border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/60 dark:border-white/5 dark:hover:bg-white/[0.02]"
						>
							<td className="px-4 py-3">
								<p className="font-medium text-[13px] text-text-strong-950 dark:text-white">
									{item.fullName}
								</p>
								<p className="text-[12px] text-text-sub-600 dark:text-white/50">
									{item.email}
								</p>
							</td>
							<td className="px-4 py-3">
								<p className="text-[13px] text-text-strong-950 dark:text-white">
									{item.company}
								</p>
								{item.website ? (
									<a
										href={
											item.website.startsWith("http")
												? item.website
												: `https://${item.website}`
										}
										target="_blank"
										rel="noreferrer"
										className="text-[12px] text-blue-600 hover:underline dark:text-blue-400"
									>
										{item.website}
									</a>
								) : null}
							</td>
							<td className="px-4 py-3 text-[12px] text-text-sub-600 dark:text-white/60">
								{item.monthlyVolume ?? "—"}
							</td>
							<td className="px-4 py-3">
								<StatusPill
									status={item.status}
									tone={STATUS_TONE[item.status]}
								/>
							</td>
							<td className="px-4 py-3 text-[12px] text-text-sub-600 dark:text-white/60">
								{formatRelativeTime(item.createdAt)}
							</td>
							<td className="px-4 py-3">
								<button
									type="button"
									onClick={() => {
										setSelected(item);
										setReviewNote(item.reviewNote ?? "");
									}}
									className="rounded-lg border border-stroke-soft-200 px-2.5 py-1.5 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
								>
									Review
								</button>
							</td>
						</tr>
					))}
				</DataTable>
				<TablePagination
					total={data?.total ?? 0}
					page={page}
					limit={limit}
					onPageChange={(p) => setPage(p)}
					onLimitChange={(l) => {
						setLimit(l);
						setPage(1);
					}}
					itemName="applications"
				/>
			</div>

			{selected ? (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
					<div className="w-full max-w-lg rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xl dark:border-white/10 dark:bg-[#111]">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
									{selected.company}
								</p>
								<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/55">
									{selected.fullName} · {selected.email}
									{selected.role ? ` · ${selected.role}` : ""}
								</p>
							</div>
							<StatusPill
								status={selected.status}
								tone={STATUS_TONE[selected.status]}
							/>
						</div>
						<p className="mt-4 whitespace-pre-wrap rounded-xl bg-bg-weak-50 p-4 text-[13.5px] text-text-strong-950 leading-relaxed dark:bg-white/5 dark:text-white/85">
							{selected.useCase}
						</p>
						<label
							htmlFor="startup-review-note"
							className="mt-4 block font-medium text-[13px] text-text-strong-950 dark:text-white"
						>
							Review note (optional)
						</label>
						<textarea
							id="startup-review-note"
							value={reviewNote}
							onChange={(e) => setReviewNote(e.target.value)}
							rows={3}
							placeholder="Internal note — e.g. approved, credits provisioned…"
							className="mt-1.5 w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-[13.5px] outline-none focus:border-primary-base dark:border-white/10 dark:bg-white/5 dark:text-white"
						/>
						<div className="mt-5 flex flex-wrap gap-2">
							<Button.Root
								variant="primary"
								mode="filled"
								size="small"
								disabled={saving}
								onClick={() => void setReview(selected, "approved")}
							>
								Approve
							</Button.Root>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={saving}
								onClick={() => void setReview(selected, "contacted")}
							>
								Contacted
							</Button.Root>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={saving}
								onClick={() => void setReview(selected, "rejected")}
							>
								Reject
							</Button.Root>
							<div className="ml-auto">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="small"
									disabled={saving}
									onClick={() => setSelected(null)}
								>
									Close
								</Button.Root>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</PageFrame>
	);
}
