"use client";
import { useLayout } from "@fe/dashboard/providers/layout-provider";

import { WebhookListSidebar } from "./components/sidebar/webhook-list";
import { WebhookListTopbar } from "./components/topbar/webhook-list";

const WebhooksPage = () => {
	const { layoutMode } = useLayout();

	if (layoutMode === "sidebar") {
		return <WebhookListSidebar />;
	}
	return <WebhookListTopbar />;
};

export default WebhooksPage;
