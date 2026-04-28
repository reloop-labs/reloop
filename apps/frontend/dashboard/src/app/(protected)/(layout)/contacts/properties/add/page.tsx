import type { Metadata } from "next";
import { AddPropertyContent } from "./add-property-content";

export const metadata: Metadata = {
	title: "Add Property · Reloop",
	description: "Create a new contact property.",
};

const AddPropertyPage = () => {
	return <AddPropertyContent />;
};

export default AddPropertyPage;
