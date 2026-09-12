import { pageMetadata } from "#/app/_lib/page-metadata";
import { CreateContactRouteClient } from "./client";

export const metadata = pageMetadata(
	"Add Contact · Reloop",
	"Create and import contacts into your audience.",
);

export default function CreateContactRoute() {
	return <CreateContactRouteClient />;
}
