import { createFileRoute } from "@tanstack/react-router";
import { DomainSetupPage } from "#/features/domain/add/setup/page";

export const Route = createFileRoute("/_dashboard/domain/add/$domainId")({
	component: DomainSetupRoute,
	head: () => ({
		meta: [
			{ title: "Configure DNS · Reloop" },
			{
				name: "description",
				content: "Add DNS records and verify your domain.",
			},
		],
	}),
});

function DomainSetupRoute() {
	const { domainId } = Route.useParams();
	return <DomainSetupPage domainId={domainId} />;
}
