import type { Metadata } from "next";
import { TopicBulkImportContent } from "./topic-bulk-import-content";

export const metadata: Metadata = {
	title: "Topic Bulk Import · Reloop",
	description: "Bulk import contacts into a specific topic.",
};

export default function BulkImportPage() {
	return <TopicBulkImportContent />;
}
