import { TopicList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/topic-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Topics · Reloop",
	description: "Manage your communication topics.",
};

const TopicsPage = () => <TopicList />;

export default TopicsPage;
