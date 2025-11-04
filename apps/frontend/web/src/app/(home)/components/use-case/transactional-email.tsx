"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const cards = [
	{
		id: 1,
		title: "Password Reset",
		icon: "key",
		color: "verified-base",
		borderColor: "border-verified-base/50",
		iconBg: "bg-verified-base/20",
		iconColor: "text-verified-base",
		message: "Password reset instructions sent to",
		highlight: "acma@reloop.com",
	},
	{
		id: 2,
		title: "Order Confirmation",
		icon: "box",
		color: "success-base",
		borderColor: "border-success-base/50",
		iconBg: "bg-success-base/20",
		iconColor: "text-success-base",
		message: "Your order #12345 has been confirmed and will ship to",
		highlight: "123 Main St",
	},
	{
		id: 3,
		title: "Account Verification",
		icon: "verified",
		color: "information-base",
		borderColor: "border-information-base/50",
		iconBg: "bg-information-base/20",
		iconColor: "text-information-base",
		message: "Please verify your account by clicking the link sent to",
		highlight: "acma@reloop.com",
	},
	{
		id: 4,
		title: "Payment Receipt",
		icon: "invoice",
		color: "warning-base",
		borderColor: "border-warning-base/50",
		iconBg: "bg-warning-base/20",
		iconColor: "text-warning-base",
		message: "Payment of",
		highlight: "$99.00",
		extra: "has been processed for order #12345.",
	},
];

export const TransactionalEmail = () => {
	return (
		<div className="relative flex border-stroke-soft-100 border-b">
			<div className="relative z-10 flex w-full border-stroke-soft-100">
				<div className="w-1/3 border-stroke-soft-100 border-r p-10">
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
				<div className="relative flex-1 border-stroke-soft-100 border-r">
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage:
								"radial-gradient(circle at 1px 1px, var(--stroke-soft-100) 1px, transparent 0)",
							backgroundSize: "10px 10px",
						}}
					/>
					<div className="relative z-10 mx-auto max-w-xl p-16">
						<div className="relative overflow-hidden">
							<div className="relative space-y-4">
								{cards.map((card, index) => {
									const shadowClasses = [
										"shadow-lg",
										"shadow-md",
										"shadow-sm",
										"shadow-sm",
									];
									const shadowClass = shadowClasses[index] || "shadow-sm";

									return (
										<div
											key={card.id}
											className={`rounded-2xl border ${card.borderColor || "border-verified-base/50"} bg-bg-white-0 px-4 py-3 ${shadowClass}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={`flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 ${card.iconBg || "bg-verified-base/20"}`}
													>
														<Icon
															name={card.icon || "key"}
															className={`h-3 w-3 ${card.iconColor || "text-verified-base"}`}
														/>
													</div>
													<p className="font-semibold text-sm">{card.title}</p>
												</div>
												<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
													Transactional
												</p>
											</div>
											<div className="mt-3 border-stroke-soft-100 border-t pt-2">
												<p className="font-medium text-sm text-text-sub-600">
													{card.message}{" "}
													<span className="font-semibold text-text-strong-950">
														{card.highlight}
													</span>
													{card.extra ? <> {card.extra}</> : "."}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
