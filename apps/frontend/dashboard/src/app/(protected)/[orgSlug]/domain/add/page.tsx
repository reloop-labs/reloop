"use client";
import { useLayout } from "@fe/dashboard/providers/layout-provider";
import { AddDomainSidebar } from "../components/sidebar/add-domain";
import { AddDomainTopbar } from "../components/topbar/add-domain";

const NewDomainPage = () => {
	const { layoutMode } = useLayout();
	if (layoutMode === "sidebar") {
		return <AddDomainSidebar />;
	}
	return <AddDomainTopbar />;
};

export default NewDomainPage;
