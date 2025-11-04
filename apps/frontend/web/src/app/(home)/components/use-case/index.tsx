import { AutomatedWorkflowEmail } from "./automated-workflow-email";
import { MarketingEmail } from "./marketing-email";
import { SystemAdminEmail } from "./system-admin-email";
import { TransactionalEmail } from "./transactional-email";

export default function UseCase() {
	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[03] USE CASES</span>
					<span className="text-sm text-text-sub-600">/ EMAIL SENDING</span>
				</div>
				<div>
					<TransactionalEmail />
					<AutomatedWorkflowEmail />
					<MarketingEmail />
					<SystemAdminEmail />
				</div>
			</div>
		</div>
	);
}
