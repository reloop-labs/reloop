import { pageMetadata } from "#/app/_lib/page-metadata";
import { WorkspacePage } from "./client";

export const metadata = pageMetadata(
	"Workspace · Reloop",
	"Customize your workspace name and logo.",
);

export default function WorkspaceRoute() {
	return <WorkspacePage />;
}
