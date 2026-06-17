"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { ActivityChartCard } from "./components/activity-chart-card";
import { AgentInboxCard } from "./components/agent-inbox-card";
import { AgentIntegrationsCard } from "./components/agent-integrations-card";
import { ApiKeyCard } from "./components/api-key-card";
import { AuditLogsCard } from "./components/audit-logs-card";
import { DomainCard } from "./components/domain-card";
import { EmailsCard } from "./components/emails-card";
import { FrameworkIntegrationsCard } from "./components/framework-integrations-card";
import { SdksCard } from "./components/sdks-card";

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			<div className="space-y-1">
				<p className="font-medium text-sm text-text-sub-600 dark:text-white/60">
					{activeOrganization?.name}
				</p>
				<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
					{user?.email ? `${user.email}'s Account` : "Your Account"}
				</h1>

				<div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="md:col-span-2 lg:col-span-2">
						<ActivityChartCard />
					</div>
					<EmailsCard />
					<AgentInboxCard />
					<DomainCard />
					<AuditLogsCard />
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<ApiKeyCard />
				</div>
				<div className="lg:col-span-2">
					<AgentIntegrationsCard />
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<SdksCard />
				<FrameworkIntegrationsCard />
			</div>
		</div>
	);
}
