import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const cardsData = [
	{
		id: 2,
		title: "Welcome Email",
		icon: "mail",
		color: "verified-base",
		borderColor: "border-verified-base",
		iconBg: "bg-verified-base/20",
		iconColor: "text-verified-base",
		message: "Welcome email sent to",
		textColor: "text-verified-base",
		highlight: "acma@reloop.com",
		subtitle: "Day 1",
	},
	{
		id: 3,
		title: "Feature Request",
		icon: "rocket",
		color: "success-base",
		borderColor: "border-success-base",
		iconBg: "bg-success-base/20",
		iconColor: "text-success-base",
		message: "Feature request sent to",
		textColor: "text-success-base",
		highlight: "acma@reloop.com",
		subtitle: "Day 2",
	},
	{
		id: 4,
		title: "Product Update",
		icon: "bulb",
		color: "warning-base",
		borderColor: "border-warning-base",
		iconBg: "bg-warning-base/20",
		iconColor: "text-warning-base",
		message: "Product update sent to",
		highlight: "acma@reloop.com",
		textColor: "text-warning-base",
		subtitle: "Day 3",
	},
	{
		id: 5,
		title: "Automation Complete",
		icon: "check-circle",
		color: "verified-base",
		borderColor: "border-verified-base",
		iconBg: "bg-verified-base/20",
		iconColor: "text-verified-base",
		message: "Automation workflow completed for",
		highlight: "acma@reloop.com",
		textColor: "text-verified-base",
		subtitle: "Day 4",
	},
];

type CardProps = {
	card: (typeof cardsData)[number];
};

const Card = ({ card }: CardProps) => {
	return (
		<div
			className={`rounded-2xl border ${card.borderColor || "border-verified-base/50"} bg-bg-white-0 px-4 py-3`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className={`flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 ${card.iconBg || "bg-verified-base/20"}`}
					>
						<Icon
							name={card.icon || "route"}
							className={`h-3 w-3 ${card.iconColor || "text-verified-base"}`}
						/>
					</div>
					<p className="font-semibold text-sm">{card.title}</p>
				</div>
				<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
					{card.subtitle}
				</p>
			</div>
			<div className="mt-3 border-stroke-soft-100 border-t pt-2">
				<p className="font-medium text-sm text-text-sub-600">
					{card.message}{" "}
					<span className="font-semibold text-text-strong-950">
						{card.highlight}
					</span>
				</p>
			</div>
		</div>
	);
};

export const AutomatedWorkflowEmail = () => {
	return (
		<div className="relative flex border-stroke-soft-100 border-r border-b">
			<div className="relative flex w-full border-stroke-soft-100">
				<div className="w-1/3 border-stroke-soft-100 border-r p-10">
					<div className="flex items-center gap-2">
						<Icon
							name="route"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
						<p className="font-semibold text-text-sub-600 text-xs">
							Automation
						</p>
					</div>
					<div className="flex-1 pt-3">
						<h2 className="mb-2 font-semibold text-3xl">Automated Emails</h2>
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
				<div className="relative flex-1 border-stroke-soft-100 border-r">
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage:
								"radial-gradient(circle at 1px 1px, var(--stroke-soft-100) 1px, transparent 0)",
							backgroundSize: "10px 10px",
						}}
					/>
					<div className="relative mx-auto max-w-xl p-16">
						<div className="flex justify-center">
							<div className="flex w-fit items-center gap-2 rounded-xl border border-success-base/50 bg-bg-white-0 py-2 pr-3 pl-2">
								<div className="flex h-5 w-5 items-center justify-center rounded-sm border border-stroke-soft-100 bg-success-base/20">
									<Icon
										name="user-plus"
										className="h-3 w-3 stroke-1 text-success-base"
									/>
								</div>
								<p className="font-semibold text-xs">New User Signup</p>
							</div>
						</div>
						<div className="-mt-1.5">
							<div className="flex flex-col items-center">
								<div className="h-px w-px rounded-full border border-success-base bg-bg-white-0 p-1" />
								<div className="h-10 w-px border-success-base border-l" />
								<Icon
									name="chevron-down"
									className="-mt-2.5 h-4 w-4 text-success-base"
								/>
							</div>
						</div>
						<div className="relative">
							<div className="relative">
								{cardsData.map((card, index) => {
									return (
										<div key={card.id} className="relative">
											<Card card={card} />
											<div className="flex flex-col items-center">
												<div
													className={`h-px w-px rounded-full border ${card.textColor || "border-verified-base/50"} -mt-1.5 bg-bg-white-0 p-1`}
												/>
												<div
													className={`h-10 w-px border-l ${card.textColor || "border-verified-base/50"}`}
												/>
												<Icon
													name="chevron-down"
													className={`-mt-2.5 h-4 w-4 ${card.textColor || "border-verified-base/50"}`}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</div>
						<div className="flex justify-center">
							<div className="flex w-fit items-center gap-2 rounded-xl border border-error-base/50 bg-bg-white-0 py-2 pr-3 pl-2">
								<div className="flex h-5 w-5 items-center justify-center rounded-sm border border-stroke-soft-100 bg-error-base/20">
									<Icon
										name="check-circle"
										className="h-3 w-3 stroke-1 text-error-base"
									/>
								</div>
								<p className="font-semibold text-xs">Automation Complete</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
