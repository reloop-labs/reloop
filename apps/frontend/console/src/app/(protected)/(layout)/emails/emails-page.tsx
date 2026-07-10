"use client";

import { adminGet } from "@fe/console/lib/admin-api";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useState } from "react";
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
};

type EmailsResponse = { items: EmailItem[]; total: number };

export default function EmailsPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");

	const { data, isLoading } = useSWR<EmailsResponse>(
		["/emails", search, status],
		() =>
			adminGet<EmailsResponse>("/emails", {
				q: search || undefined,
				status: status || undefined,
				limit: 50,
			}),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h4">
						Emails
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Cross-org email investigation ({data?.total ?? 0} matching)
					</p>
				</div>
				<form
					className="flex flex-wrap gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						setSearch(q);
					}}
				>
					<Input.Root className="w-56">
						<Input.Wrapper>
							<Input.Input
								placeholder="Search from / subject / to"
								value={q}
								onChange={(e) => setQ(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
					<select
						className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
					>
						<option value="">All statuses</option>
						<option value="bounced">Bounced</option>
						<option value="failed">Failed</option>
						<option value="spam">Spam</option>
						<option value="sent">Sent</option>
						<option value="delivered">Delivered</option>
						<option value="pending">Pending</option>
					</select>
					<Button.Root type="submit" variant="neutral" mode="stroke">
						Search
					</Button.Root>
				</form>
			</div>

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100">
				<table className="w-full text-left text-paragraph-sm">
					<thead className="bg-bg-weak-50 text-[12px] text-text-sub-600 uppercase">
						<tr>
							<th className="px-4 py-3 font-medium">When</th>
							<th className="px-4 py-3 font-medium">From</th>
							<th className="px-4 py-3 font-medium">Subject</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium">Org</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={5}>
									Loading...
								</td>
							</tr>
						) : !data?.items.length ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={5}>
									No emails found
								</td>
							</tr>
						) : (
							data.items.map((email) => (
								<tr key={email.id} className="border-stroke-soft-100 border-t">
									<td className="px-4 py-3 text-text-sub-600">
										{new Date(email.createdAt).toLocaleString()}
									</td>
									<td className="px-4 py-3">{email.fromEmail}</td>
									<td className="max-w-xs truncate px-4 py-3">
										{email.subject}
									</td>
									<td className="px-4 py-3">
										<Badge.Root
											variant="light"
											color={
												email.status === "bounced" ||
												email.status === "failed" ||
												email.status === "spam"
													? "red"
													: email.status === "delivered"
														? "green"
														: "gray"
											}
										>
											{email.status}
										</Badge.Root>
									</td>
									<td className="px-4 py-3 font-mono text-[11px] text-text-sub-600">
										{email.organizationId}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
