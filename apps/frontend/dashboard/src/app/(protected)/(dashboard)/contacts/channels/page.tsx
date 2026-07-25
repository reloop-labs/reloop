import { pageMetadata } from "#/app/_lib/page-metadata";
import { ChannelList } from "./client";

export const metadata = pageMetadata(
	"Channels · Reloop",
	"Subscription channels for your audience.",
);

export default function ContactChannelsRoute() {
	return <ChannelList />;
}
