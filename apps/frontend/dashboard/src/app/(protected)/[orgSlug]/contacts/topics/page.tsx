import type { Metadata } from "next";
import { TopicList } from "../components/topic-list";

export const metadata: Metadata = {
	title: "Topics · Reloop",
	description: "Manage your communication topics.",
};

const TopicsPage = () => <TopicList />;

export default TopicsPage;
