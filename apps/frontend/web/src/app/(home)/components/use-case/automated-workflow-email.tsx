import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export const AutomatedWorkflowEmail = () => {
	return (
		<div className="flex border-stroke-soft-100 border-r border-b">
			<div className="flex-1 border-stroke-soft-100 border-r p-10">
				<div className="flex items-center gap-2">
					<Icon
						name="route"
						className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
					/>
					<p className="font-semibold text-text-sub-600 text-xs">
						Automated / Workflow
					</p>
				</div>
				<div className="flex-1 pt-3">
					<h2 className="mb-2 font-semibold text-3xl">
						Automated / Workflow Emails
					</h2>
					<p className="text-text-sub-600 tracking-wide">
						Drive engagement and automate user journeys.
					</p>
					<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
						<li>Welcome series for new users</li>
						<li>Trial-to-paid upgrade reminders</li>
						<li>Re-engagement emails after inactivity</li>
					</ul>
					<Button.Root variant="neutral" mode="lighter" size="small">
						View Docs
						<Icon
							name="chevron-right"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
					</Button.Root>
				</div>
			</div>
			<div className="flex-1">
				<div className="border-stroke-soft-100 border-r border-b p-10">
					<div className="flex items-center gap-2">
						<Icon
							name="route"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
