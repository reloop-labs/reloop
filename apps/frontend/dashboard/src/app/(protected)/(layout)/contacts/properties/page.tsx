import type { Metadata } from "next";
import { PropertyList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/properties/property-list";

export const metadata: Metadata = {
	title: "Properties · Reloop",
	description: "Manage your contact properties.",
};

const PropertiesPage = () => {
	return <PropertyList />;
};

export default PropertiesPage;
