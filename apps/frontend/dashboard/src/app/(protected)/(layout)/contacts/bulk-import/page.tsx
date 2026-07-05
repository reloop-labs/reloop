import type { Metadata } from "next";
import { BulkImportContent } from "./bulk-import-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Bulk Import · Reloop",
	description: "Import your contacts from a CSV file.",
};

export default function BulkImportPage() {
	return <BulkImportContent />;
}
