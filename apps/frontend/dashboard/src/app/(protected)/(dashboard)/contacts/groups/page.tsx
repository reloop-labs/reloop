import { pageMetadata } from "#/app/_lib/page-metadata";
import { GroupList } from "./client";

export const metadata = pageMetadata(
	"Groups · Reloop",
	"Organize contacts into groups.",
);

export default function ContactGroupsRoute() {
	return <GroupList />;
}
