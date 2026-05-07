import { Icon } from "@reloop/ui/icon";

export const AccountHeader = () => {
	return (
		<>
			<div className="mb-5 flex items-center gap-2 rounded-xl bg-bg-weak-50/60 p-2 text-sm text-text-sub-600">
				<Icon name="info-outline" className="h-4 w-4" />
				Changes to your profile will apply to all of your workspaces.
			</div>
			<div className="mb-4">
				<p className="font-medium text-label-md text-text-strong-950">
					Profile
				</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your personal details
				</p>
			</div>
		</>
	);
};
