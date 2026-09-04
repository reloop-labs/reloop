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

	const isDetailPage =
		/\/automation\/(?!(?:triggers|events)(?:$|\/))[^/]+/.test(pathname);
	const isTriggersPage =
		pathname.includes("/automation/triggers") ||
		pathname.includes("/automation/events");

	const handleCreate = useCallback(() => {
		if (!activeOrganization?.slug) return;
		if (isTriggersPage) {
			void setModal("create-event");
		} else {
			void setModal("create-workflow");
		}
	}, [activeOrganization?.slug, isTriggersPage, setModal]);

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
				createLabel={isTriggersPage ? "Create trigger" : "Create automation"}
				title={isTriggersPage ? "Triggers" : "Automation"}
				description={
					isTriggersPage
						? "Custom triggers that start automations. Separate from webhooks."
						: "Trigger emails from events — delays, conditions, and sends."
				}
				icon={isTriggersPage ? "zap" : "workflow"}
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
