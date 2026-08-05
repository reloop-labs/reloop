import { Icon } from "@reloop/ui/icon";

export function AccountHeader() {
	return (
		<>
			<div className="mb-5 flex items-center gap-2 rounded-xl bg-bg-weak-50/60 p-2 text-sm text-text-sub-600">
				<Icon name="info-outline" className="h-4 w-4" />
				Changes to your profile will apply to all of your organizations.
			</div>
			<div className="mb-4">
				<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
					Profile
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
					Manage your personal details.
				</p>
			</div>
		</>
	);
}
