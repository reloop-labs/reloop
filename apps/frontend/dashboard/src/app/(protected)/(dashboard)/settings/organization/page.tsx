import { pageMetadata } from "#/app/_lib/page-metadata";
import { OrganizationPage } from "./client";

export const metadata = pageMetadata(
	"Organization · Reloop",
	"Customize your organization name and logo.",
);

export default function OrganizationRoute() {
	return <OrganizationPage />;
}
