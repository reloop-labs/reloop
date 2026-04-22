import type { Metadata } from "next";
import { TopicDetailContent } from "./topic-detail-content";

export const metadata: Metadata = {
	title: "Topic Detail · Reloop",
	description: "View and manage communication topic details.",
};

export default function TopicDetailPage() {
	return <TopicDetailContent />;
}
