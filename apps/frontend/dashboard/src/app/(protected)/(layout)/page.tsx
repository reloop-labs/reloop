"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();

	return (
		<div className="flex-1 overflow-y-auto p-8">
			<div className="mx-auto max-w-6xl space-y-12">
				{/* Welcome Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-text-strong-950">
						Welcome back, {user?.name || user?.email.split("@")[0]}
					</h1>
					<p className="text-text-sub-600">
						Here's what's happening with {activeOrganization?.name} today.
					</p>
				</div>
			</div>
		</div>
	);
}
