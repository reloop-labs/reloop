import type { Metadata } from "next";
import { ChannelDetailContent } from "./channel-detail-content";

export const metadata: Metadata = {
	title: "Channel Detail · Reloop",
	description: "View and manage communication channel details.",
};

export default function ChannelDetailPage() {
	return <ChannelDetailContent />;
}
