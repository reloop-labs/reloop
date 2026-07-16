import { LogList } from "./log-list";

export function LogsPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-2 p-6 lg:p-8">
			<div className="pt-2">
				<h1 className="font-semibold text-text-strong-950 text-title-h5">
					Logs
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Inspect API requests and delivery events for your workspace.
				</p>
			</div>
			<LogList />
		</div>
	);
}
