"use client";

import { adminGet } from "@fe/console/lib/admin-api";
import useSWR from "swr";

type Overview = {
	users: number;
	organizations: { total: number; active: number; suspended: number };
	domains: {
		total: number;
		active: number;
		failed: number;
		suspended: number;
	};
	emails: { sentToday: number; bouncedToday: number; failedToday: number };
	credits: { totalRemaining: number };
};

function StatCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: string | number;
	hint?: string;
}) {
	return (
		<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/40">
			<p className="text-[12px] text-text-sub-600 uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-2 font-semibold text-text-strong-950 text-title-h4">
				{value}
			</p>
			{hint ? (
				<p className="mt-1 text-[12px] text-text-sub-600">{hint}</p>
			) : null}
		</div>
	);
}

export default function OverviewPage() {
	const { data, isLoading, error } = useSWR<Overview>(
		"/api/console/v1/overview",
		() => adminGet<Overview>("/overview"),
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h4">
					Overview
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Platform health across all organizations.
				</p>
			</div>

			{error ? (
				<p className="text-error-base text-paragraph-sm">
					Failed to load overview. Ensure the admin API is running and you are a
					platform super-admin.
				</p>
			) : null}

			{isLoading || !data ? (
				<p className="text-paragraph-sm text-text-sub-600">Loading...</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<StatCard label="Users" value={data.users} />
					<StatCard
						label="Organizations"
						value={data.organizations.total}
						hint={`${data.organizations.active} active · ${data.organizations.suspended} suspended`}
					/>
					<StatCard
						label="Domains"
						value={data.domains.total}
						hint={`${data.domains.active} active · ${data.domains.failed} failed · ${data.domains.suspended} suspended`}
					/>
					<StatCard
						label="Emails today"
						value={data.emails.sentToday}
						hint={`${data.emails.bouncedToday} bounced · ${data.emails.failedToday} failed`}
					/>
					<StatCard
						label="Credits remaining"
						value={data.credits.totalRemaining.toLocaleString()}
						hint="Sum across all orgs"
					/>
				</div>
			)}
		</div>
	);
}
