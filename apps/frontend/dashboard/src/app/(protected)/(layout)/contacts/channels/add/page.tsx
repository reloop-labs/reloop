import type { Metadata } from "next";
import { CreateChannelPage } from "./components/create-channel-page";

export const metadata: Metadata = {
	title: "Create Channel · Reloop",
	description: "Create a new communication channel for your contacts.",
};

const AddChannelPage = () => <CreateChannelPage />;

export default AddChannelPage;
