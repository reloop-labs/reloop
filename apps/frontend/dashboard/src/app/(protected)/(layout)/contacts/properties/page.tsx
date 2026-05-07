import { PropertyList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/properties/property-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Properties · Reloop",
	description: "Manage your contact properties.",
};

const PropertiesPage = () => {
	return <PropertyList />;
};

export default PropertiesPage;
