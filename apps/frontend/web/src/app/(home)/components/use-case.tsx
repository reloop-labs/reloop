import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

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
					<NotificationEmail />
					<SystemAdminEmail />
				</div>
			</div>
		</div>
	);
}

const TransactionalEmail = () => {
	return (
		<div className="relative flex border-stroke-soft-100 border-b">
			<div
				className="-z-0 absolute inset-0"
				style={{
					backgroundImage:
						"repeating-linear-gradient(45deg, transparent, transparent 2px, var(--stroke-soft-100) 6px, var(--stroke-soft-100) 4px)",
				}}
			/>
			<div className="relative z-10 mx-24 flex w-full border-stroke-soft-100 border-r border-l bg-bg-white-0">
				<div className="flex-1 border-stroke-soft-100 border-r p-10">
					<div className="flex items-center gap-2">
						<Icon
							name="arrow-swap"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
						<p className="font-semibold text-text-sub-600 text-xs">
							Transactional
						</p>
					</div>
					<div className="flex-1 pt-3">
						<h2 className="mb-2 font-semibold text-3xl">Transactional Email</h2>
						<p className="text-text-sub-600 tracking-wide">
							Provide essential, real-time user updates.
						</p>

						<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
							<li>Password reset</li>
							<li>Order confirmation</li>
							<li>Account verification</li>
							<li>Payment receipts</li>
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
				<div className="relative flex-1">
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage:
								"radial-gradient(circle at 1px 1px, var(--stroke-soft-100) 1px, transparent 0)",
							backgroundSize: "10px 10px",
						}}
					/>
					<div className="relative z-10 space-y-10 p-16">
						<div className="rounded-2xl border border-verified-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-verified-base/20">
										<Icon name="key" className="h-3 w-3 text-verified-base" />
									</div>
									<p className="font-semibold text-sm">Password Reset</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Password reset instructions sent to{" "}
									<span className="font-semibold text-text-strong-950">
										acma@reloop.com
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-success-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-success-base/20">
										<Icon name="box" className="h-3 w-3 text-success-base" />
									</div>
									<p className="font-semibold text-sm">Order Confirmation</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Your order #12345 has been confirmed and will ship to{" "}
									<span className="font-semibold text-text-strong-950">
										123 Main St
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-information-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-information-base/20">
										<Icon
											name="verified"
											className="h-3 w-3 text-information-base"
										/>
									</div>
									<p className="font-semibold text-sm">Account Verification</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Please verify your account by clicking the link sent to{" "}
									<span className="font-semibold text-text-strong-950">
										acma@reloop.com
									</span>
									.
								</p>
							</div>
						</div>
						<div className="rounded-2xl border border-warning-base/50 bg-bg-white-0 px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 bg-warning-base/20">
										<Icon
											name="invoice"
											className="h-3 w-3 text-warning-base"
										/>
									</div>
									<p className="font-semibold text-sm">Payment Receipt</p>
								</div>
								<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
									Transactional
								</p>
							</div>
							<div className="mt-3 border-stroke-soft-100 border-t pt-2">
								<p className="font-medium text-sm text-text-sub-600">
									Payment of{" "}
									<span className="font-semibold text-text-strong-950">
										$99.00
									</span>{" "}
									has been processed for order #12345.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const AutomatedWorkflowEmail = () => {
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

const MarketingEmail = () => {
	return (
		<div className="flex border-stroke-soft-100 border-r border-b">
			<div className="flex-1 border-stroke-soft-100 border-r p-10">
				<div className="flex items-center gap-2">
					<Icon
						name="mega-phone"
						className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
					/>
					<p className="font-semibold text-text-sub-600 text-xs">Marketing</p>
				</div>
				<div className="flex-1 pt-3">
					<h2 className="mb-2 font-semibold text-3xl">Marketing Emails</h2>
					<p className="text-text-sub-600 tracking-wide">
						Build brand loyalty and conversions.
					</p>

					<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
						<li>Product launches</li>
						<li>Newsletters</li>
						<li>Promotional offers</li>
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

const NotificationEmail = () => {
	return (
		<div className="flex border-stroke-soft-100 border-r border-b">
			<div className="flex-1 border-stroke-soft-100 border-r p-10">
				<div className="flex items-center gap-2">
					<Icon
						name="bell-plus"
						className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
					/>
					<p className="font-semibold text-text-sub-600 text-xs">
						Notification
					</p>
				</div>
				<div className="flex-1 pt-3">
					<h2 className="mb-2 font-semibold text-3xl">Notification Emails</h2>
					<p className="text-text-sub-600 tracking-wide">
						Real-time updates and activity alerts.
					</p>

					<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
						<li>"Your report is ready"</li>
						<li>"New login from another device"</li>
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

const SystemAdminEmail = () => {
	return (
		<div className="flex border-stroke-soft-100 border-r border-b">
			<div className="flex-1 border-stroke-soft-100 border-r p-10">
				<div className="flex items-center gap-2">
					<Icon name="gear" className="h-3 w-3 stroke-1 text-text-sub-600" />
					<p className="font-semibold text-text-sub-600 text-xs">
						System / Admin
					</p>
				</div>
				<div className="flex-1 pt-3">
					<h2 className="mb-2 font-semibold text-3xl">
						System or Admin Emails
					</h2>
					<p className="text-text-sub-600 tracking-wide">
						For internal or technical communication.
					</p>

					<ul className="mt-4 mb-6 ml-4 list-inside list-disc text-sm text-text-sub-600 tracking-wide">
						<li>Error logs</li>
						<li>Server downtime alerts</li>
						<li>Admin approvals or reports</li>
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
