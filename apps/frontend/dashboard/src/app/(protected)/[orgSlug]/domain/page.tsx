"use client";
import { useLayout } from "@dashboard/providers/layout-provider";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { DomainListSidebar } from "./components/sidebar/domain-list";
import { DomainListTopbar } from "./components/topbar/domain-list";

const DomainPage = () => {
	const { layoutMode } = useLayout();

	if (layoutMode === "sidebar") {
		return <DomainListSidebar />;
	}
	return <DomainListTopbar />;
};

export default DomainPage;
