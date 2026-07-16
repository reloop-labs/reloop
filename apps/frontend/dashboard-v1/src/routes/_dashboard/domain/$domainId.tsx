import { createFileRoute } from "@tanstack/react-router";
import { DomainDetailPage } from "#/features/domain/detail/page";

export const Route = createFileRoute("/_dashboard/domain/$domainId")({
	component: DomainDetailRoute,
	head: () => ({
		meta: [
			{ title: "Domain · Reloop" },
			{
				name: "description",
				content: "View domain status, DNS records, and configuration.",
			},
		],
	}),
});

function DomainDetailRoute() {
	const { domainId } = Route.useParams();
	return <DomainDetailPage domainId={domainId} />;
}
