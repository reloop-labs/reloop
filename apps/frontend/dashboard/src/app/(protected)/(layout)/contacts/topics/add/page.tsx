import type { Metadata } from "next";
import { CreateTopicPage } from "./components/create-topic-page";

export const metadata: Metadata = {
	title: "Create Topic · Reloop",
	description: "Create a new communication topic for your contacts.",
};

const AddTopicPage = () => <CreateTopicPage />;

export default AddTopicPage;
