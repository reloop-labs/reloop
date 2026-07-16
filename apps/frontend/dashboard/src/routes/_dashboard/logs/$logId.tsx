import { createFileRoute } from "@tanstack/react-router";
import { LogDetailPage } from "#/features/logs/log-detail-page";

export const Route = createFileRoute("/_dashboard/logs/$logId")({
	component: LogDetailRoute,
	head: () => ({
		meta: [
			{ title: "Log · Reloop" },
			{
				name: "description",
				content: "View full details for a single log entry.",
			},
		],
	}),
});

function LogDetailRoute() {
	const { logId } = Route.useParams();
	return <LogDetailPage logId={logId} />;
}
