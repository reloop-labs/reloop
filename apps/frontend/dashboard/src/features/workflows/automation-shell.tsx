"use client";

import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { type ReactNode, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { AutomationListHeader } from "./components/automation-list-header";
import { AutomationTabs } from "./components/automation-tabs";
import { CreateEventModal } from "./components/create-event-modal";
import { CreateWorkflowModal } from "./components/create-workflow-modal";

export function AutomationShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const { activeOrganization } = useActiveOrganization();
	const [modal, setModal] = useQueryState("modal", { history: "replace" });

	const isDetailPage = /\/automation\/(?!events(?:$|\/))[^/]+/.test(pathname);
	const isEventsPage = pathname.includes("/automation/events");

	const handleCreate = useCallback(() => {
		if (!activeOrganization?.slug) return;
		if (isEventsPage) {
			void setModal("create-event");
		} else {
			void setModal("create-workflow");
		}
	}, [activeOrganization?.slug, isEventsPage, setModal]);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			handleCreate();
		},
		{ enableOnFormTags: false, preventDefault: true, enabled: !isDetailPage },
	);

	if (isDetailPage) {
		return <>{children}</>;
	}

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<AutomationListHeader
				onCreate={handleCreate}
				createLabel={isEventsPage ? "Create trigger" : "Create automation"}
				title={isEventsPage ? "Triggers" : "Automation"}
				description={
					isEventsPage
						? "Custom triggers that start automations. Separate from webhooks."
						: "Trigger emails from events — delays, conditions, and sends."
				}
				icon={isEventsPage ? "zap" : "workflow"}
			/>

			<div className="space-y-4">
				<AutomationTabs />
				{children}
			</div>

			<CreateWorkflowModal
				open={modal === "create-workflow"}
				onOpenChange={(open) => {
					if (!open) void setModal(null);
				}}
			/>
			<CreateEventModal
				open={modal === "create-event"}
				onOpenChange={(open) => {
					if (!open) void setModal(null);
				}}
			/>
		</div>
	);
}
