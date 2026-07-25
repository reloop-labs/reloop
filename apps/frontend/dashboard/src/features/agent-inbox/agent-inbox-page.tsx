import { AgentInboxCommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { AgentMailboxList } from "./components/agent-mailbox-list";
import { AgentMailboxListHeader } from "./list/agent-mailbox-list-header";

export function AgentInboxPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<AgentMailboxListHeader />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<div className="lg:col-span-8 xl:col-span-8">
					<AgentMailboxList />
				</div>
				<div className="lg:col-span-4 xl:col-span-4">
					<AgentInboxCommonUseCasesSidebar />
				</div>
			</div>
		</div>
	);
}
