"use client";

import { adminGet } from "@fe/console/lib/admin-api";
import useSWR from "swr";

type AuditItem = {
	id: string;
	actorUserId: string;
	actorEmail: string | null;
	actorName: string | null;
	action: string;
	resourceType: string;
	resourceId: string | null;
	organizationId: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
};

type AuditResponse = { items: AuditItem[]; total: number };

export default function AuditPage() {
	const { data, isLoading } = useSWR<AuditResponse>("/audit", () =>
		adminGet<AuditResponse>("/audit", { limit: 100 }),
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h4">
					Audit log
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Platform admin actions ({data?.total ?? 0} total)
				</p>
			</div>

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100">
				<table className="w-full text-left text-paragraph-sm">
					<thead className="bg-bg-weak-50 text-[12px] text-text-sub-600 uppercase">
						<tr>
							<th className="px-4 py-3 font-medium">When</th>
							<th className="px-4 py-3 font-medium">Actor</th>
							<th className="px-4 py-3 font-medium">Action</th>
							<th className="px-4 py-3 font-medium">Resource</th>
							<th className="px-4 py-3 font-medium">Details</th>
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
									No audit events yet
								</td>
							</tr>
						) : (
							data.items.map((item) => (
								<tr key={item.id} className="border-stroke-soft-100 border-t">
									<td className="px-4 py-3 text-text-sub-600">
										{new Date(item.createdAt).toLocaleString()}
									</td>
									<td className="px-4 py-3">
										<p className="font-medium">
											{item.actorName || item.actorUserId}
										</p>
										<p className="text-[12px] text-text-sub-600">
											{item.actorEmail}
										</p>
									</td>
									<td className="px-4 py-3 font-mono text-[12px]">
										{item.action}
									</td>
									<td className="px-4 py-3">
										<p>{item.resourceType}</p>
										<p className="font-mono text-[11px] text-text-sub-600">
											{item.resourceId || "—"}
										</p>
									</td>
									<td className="max-w-xs truncate px-4 py-3 text-[12px] text-text-sub-600">
										{item.metadata
											? JSON.stringify(item.metadata)
											: item.organizationId || "—"}
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
