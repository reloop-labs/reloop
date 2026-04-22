"use client";
import { authClient } from "@reloop/auth/client";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

const Home = () => {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const { data: organizations, isLoading: organizationsLoading } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);

	useEffect(() => {
		const handleRedirect = async () => {
			if (!isPending && !organizationsLoading && organizations && session) {
				if (!organizations || organizations.length === 0) {
					router.push("/onboarding");
					return;
				}
			} else {
				if (!isPending) {
					router.push("/login");
				}
			}
		};

		handleRedirect();
	}, [isPending, organizationsLoading, organizations]);

	return (
		<div className="flex h-screen items-center justify-center">
			<Spinner />
		</div>
	);
};

export default Home;
