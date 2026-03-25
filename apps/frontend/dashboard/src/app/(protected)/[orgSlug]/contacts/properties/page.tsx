import type { Metadata } from "next";
import { PropertyList } from "../components/property-list";

export const metadata: Metadata = {
	title: "Properties · Reloop",
	description: "Manage your contact properties.",
};

const PropertiesPage = () => {
	return <PropertyList />;
};

export default PropertiesPage;
