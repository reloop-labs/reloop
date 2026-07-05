import { PropertyList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/properties/property-list";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Properties · Reloop",
	description: "Manage your contact properties.",
};

const PropertiesPage = () => {
	return <PropertyList />;
};

export default PropertiesPage;
