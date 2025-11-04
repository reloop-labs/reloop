import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

const useCases = [
	{
		icon: <Icon name="mail" className="h-[42px] w-[42px] text-text-sub-600" />,
		title: "Transactional emails",
		description: "Send welcome emails, receipts, and confirmations.",
		example: {
			subject: "Welcome to Reloop!",
			recipient: "user@example.com",
			status: "Delivered",
			timestamp: "2 min ago",
		},
	},
	{
		icon: <Icon name="mail" className="h-[42px] w-[42px] text-text-sub-600" />,
		title: "Marketing campaigns",
		description: "Reach your audience with personalized newsletters.",
		example: {
			subject: "Weekly Product Updates",
			recipient: "newsletter@example.com",
			status: "Sent",
			timestamp: "5 min ago",
		},
	},
	{
		icon: <Icon name="mail" className="h-[42px] w-[42px] text-text-sub-600" />,
		title: "Automated notifications",
		description: "Trigger emails based on user actions and events.",
		example: {
			subject: "Password Reset Request",
			recipient: "support@example.com",
			status: "Delivered",
			timestamp: "1 min ago",
		},
	},
];

export default function UseCase() {
	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[03] USE CASES</span>
					<span className="text-sm text-text-sub-600">/ EMAIL SENDING</span>
				</div>
				<div className="flex items-stretch">
					{/* Left Section */}
					<div className="flex-1 space-y-6 py-20 pr-20 pl-10">
						<h2 className="max-w-2xl font-semibold text-3xl text-text-strong-950">
							Send emails that matter.{" "}
							<span className="text-text-sub-600 leading-8">
								Power your applications with reliable email infrastructure for
								transactional, marketing, and automated messages.
							</span>
						</h2>
						<div className="space-y-6 pt-8">
							{useCases.map((useCase, index) => (
								<div key={index} className="flex gap-4">
									<div className="flex-shrink-0">{useCase.icon}</div>
									<div className="space-y-2">
										<h3 className="font-semibold text-lg text-text-strong-950">
											{useCase.title}
										</h3>
										<p className="text-sm text-text-sub-600">
											{useCase.description}
										</p>
									</div>
								</div>
							))}
						</div>
						<div className="flex gap-4 pt-4">
							<Link
								href="/contact"
								className={Button.buttonVariants({
									variant: "neutral",
									size: "small",
								}).root({})}
							>
								Get Started
							</Link>
							<Link
								href="/docs"
								className={Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
									size: "small",
								}).root({})}
							>
								View Docs
							</Link>
						</div>
					</div>

					{/* Right Section - Email Preview */}
					<div className="w-full max-w-md border-stroke-soft-100 border-l bg-stroke-soft-50 p-8">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-sm text-text-strong-950">
									Recent sends
								</span>
								<span className="text-text-sub-600 text-xs">
									Live • Updated now
								</span>
							</div>
							<div className="space-y-3">
								{useCases.map((useCase, index) => (
									<div
										key={index}
										className="rounded-lg border border-stroke-soft-100 bg-white p-4 shadow-sm"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<Icon
														name="mail"
														className="h-4 w-4 text-text-sub-600"
													/>
													<span className="font-medium text-sm text-text-strong-950">
														{useCase.example.subject}
													</span>
												</div>
												<p className="text-text-sub-600 text-xs">
													To: {useCase.example.recipient}
												</p>
											</div>
											<div className="flex flex-col items-end gap-1">
												<span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs">
													{useCase.example.status}
												</span>
												<span className="text-text-sub-600 text-xs">
													{useCase.example.timestamp}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="pt-4">
								<div className="rounded-lg border border-stroke-soft-100 bg-white p-4">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-sm text-text-strong-950">
											Total sent today
										</span>
										<span className="font-semibold text-2xl text-text-strong-950">
											12,847
										</span>
									</div>
									<div className="mt-2 flex items-center gap-2 text-text-sub-600 text-xs">
										<span>99.9% delivered</span>
										<span>•</span>
										<span>&lt; 900ms avg</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
