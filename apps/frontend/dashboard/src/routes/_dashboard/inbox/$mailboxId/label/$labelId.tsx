import { LabelFolderPage } from "#/features/agent-inbox/pages/mailbox-folder-pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_dashboard/inbox/$mailboxId/label/$labelId",
)({
	component: LabelFolderPage,
});
