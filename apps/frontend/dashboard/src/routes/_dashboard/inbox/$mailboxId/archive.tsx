import { ArchiveFolderPage } from "#/features/agent-inbox/pages/mailbox-folder-pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/inbox/$mailboxId/archive")({
	component: ArchiveFolderPage,
});
