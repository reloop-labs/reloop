import type { Metadata } from "next";
import { ChannelBulkImportContent } from "./channel-bulk-import-content";

export const metadata: Metadata = {
	title: "Channel Bulk Import · Reloop",
	description: "Bulk import contacts into a specific channel.",
};

export default function BulkImportPage() {
	return <ChannelBulkImportContent />;
}
