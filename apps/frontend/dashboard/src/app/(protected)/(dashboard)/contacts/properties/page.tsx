import { pageMetadata } from "#/app/_lib/page-metadata";
import { PropertyList } from "./client";

export const metadata = pageMetadata(
	"Properties · Reloop",
	"Custom contact properties for your audience.",
);

export default function ContactPropertiesRoute() {
	return <PropertyList />;
}
