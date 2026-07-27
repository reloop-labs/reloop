import { pageMetadata } from "#/app/_lib/page-metadata";
import { TemplateList } from "./client";

export const metadata = pageMetadata(
	"Templates · Reloop",
	"Design and manage reusable email templates.",
);

export default function TemplatesRoute() {
	return <TemplateList />;
}
