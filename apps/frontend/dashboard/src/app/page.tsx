"use client";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { authClient } from "packages/auth/src/client";
import { useEffect } from "react";
import useSWR from "swr";

const Home = () => {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const activeOrganizationId = session?.user.activeOrganizationId;
	const { data: organizations, isLoading: organizationsLoading } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);

	useEffect(() => {
		const handleRedirect = async () => {
			if (!isPending && !organizationsLoading && organizations) {
				if (!organizations || organizations.length === 0) {
					console.log("No organizations found");
					return;
				}
				if (!activeOrganizationId) {
					const firstOrg = organizations[0];
					if (firstOrg?.slug) {
						await authClient.organization.setActive({
							organizationId: firstOrg.id,
						});
						router.push(`/${firstOrg.slug}`);
					}
					return;
				}
				const activeOrg = organizations.find(
					(org) => org.id === activeOrganizationId,
				);
				if (activeOrg?.slug) {
					router.push(`/${activeOrg.slug}`);
				}
			}
		};

		handleRedirect();
	}, [
		isPending,
		organizationsLoading,
		organizations,
		activeOrganizationId,
		router,
	]);

	return (
		<div className="flex h-screen items-center justify-center">
			<Spinner />
		</div>
	);
};

export default Home;
