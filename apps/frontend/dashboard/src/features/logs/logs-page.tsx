import { LogList } from "./log-list";
import { LogsListHeader } from "./logs-list-header";

export function LogsPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
			<LogsListHeader />
			<LogList />
		</div>
	);
}
