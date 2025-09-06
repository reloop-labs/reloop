import { UserOrgInfo } from "@dashboard/components/user-org-info";

export default function Home() {
	return (
		<div className="container mx-auto p-8">
			<h1 className="mb-6 font-bold text-2xl">Organization Dashboard</h1>
			<UserOrgInfo />
		</div>
	);
}
