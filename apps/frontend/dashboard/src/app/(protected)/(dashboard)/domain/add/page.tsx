import { pageMetadata } from "#/app/_lib/page-metadata";
import { AddDomainPage } from "./client";

export const metadata = pageMetadata(
	"Add Domain · Reloop",
	"Add a custom domain for sending email.",
);

export default function AddDomainRoute() {
	return <AddDomainPage />;
}
