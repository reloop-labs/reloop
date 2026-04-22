import type { Metadata } from "next";
import { BulkImportContent } from "./bulk-import-content";

export const metadata: Metadata = {
	title: "Bulk Import · Reloop",
	description: "Import your contacts from a CSV file.",
};

export default function BulkImportPage() {
	return <BulkImportContent />;
}
