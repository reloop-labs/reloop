"use client";
import { useLayout } from "@fe/dashboard/providers/layout-provider";

import { AudienceGroupListSidebar } from "./components/sidebar/audience-group-list";
import { AudienceGroupListTopbar } from "./components/topbar/audience-group-list";

const AudiencePage = () => {
	const { layoutMode } = useLayout();

	if (layoutMode === "sidebar") {
		return <AudienceGroupListSidebar />;
	}
	return <AudienceGroupListTopbar />;
};

export default AudiencePage;
