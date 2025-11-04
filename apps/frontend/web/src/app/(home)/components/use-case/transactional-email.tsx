"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % cards.length);
		}, 3000); // Rotate every 3 seconds

		return () => clearInterval(interval);
	}, []);
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
						<div className="relative h-[180px]">
							<AnimatePresence mode="popLayout">
								{/* Top Card - Fully Visible */}
								<motion.div
									key={`top-${currentIndex}`}
									className={`absolute right-0 left-0 z-20 rounded-2xl border ${cards[currentIndex]?.borderColor || "border-verified-base/50"} bg-bg-white-0 px-4 py-3 shadow-lg`}
									initial={{
										opacity: 0,
										y: -100,
										scale: 0.8,
										filter: "blur(8px)",
									}}
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
										filter: "blur(0px)",
									}}
									exit={{
										opacity: 0,
										y: 100,
										scale: 0.9,
										filter: "blur(4px)",
									}}
									transition={{
										type: "spring",
										stiffness: 100,
										damping: 15,
									}}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className={`flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 ${cards[currentIndex]?.iconBg || "bg-verified-base/20"}`}
											>
												<Icon
													name={cards[currentIndex]?.icon || "key"}
													className={`h-3 w-3 ${cards[currentIndex]?.iconColor || "text-verified-base"}`}
												/>
											</div>
											<p className="font-semibold text-sm">
												{cards[currentIndex]?.title}
											</p>
										</div>
										<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
											Transactional
										</p>
									</div>
									<div className="mt-3 border-stroke-soft-100 border-t pt-2">
										<p className="font-medium text-sm text-text-sub-600">
											{cards[currentIndex]?.message}{" "}
											<span className="font-semibold text-text-strong-950">
												{cards[currentIndex]?.highlight}
											</span>
											{cards[currentIndex]?.extra ? (
												<> {cards[currentIndex].extra}</>
											) : (
												"."
											)}
										</p>
									</div>
								</motion.div>

								{/* Behind Card - Blurred */}
								{(() => {
									const nextCard = cards[(currentIndex + 1) % cards.length];
									return (
										<motion.div
											key={`behind-${(currentIndex + 1) % cards.length}`}
											className={`absolute top-4 right-0 left-0 z-10 rounded-2xl border ${nextCard?.borderColor || "border-success-base/50"} bg-bg-white-0 px-4 py-3 shadow-md`}
											initial={{
												opacity: 0,
												y: -50,
												scale: 0.85,
												filter: "blur(8px)",
											}}
											animate={{
												opacity: 0.6,
												y: 20,
												scale: 0.95,
												filter: "blur(6px)",
											}}
											exit={{
												opacity: 0,
												y: 50,
												scale: 0.9,
												filter: "blur(8px)",
											}}
											transition={{
												type: "spring",
												stiffness: 100,
												damping: 15,
											}}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={`flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 ${nextCard?.iconBg || "bg-success-base/20"}`}
													>
														<Icon
															name={nextCard?.icon || "box"}
															className={`h-3 w-3 ${nextCard?.iconColor || "text-success-base"}`}
														/>
													</div>
													<p className="font-semibold text-sm">
														{nextCard?.title}
													</p>
												</div>
												<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
													Transactional
												</p>
											</div>
											<div className="mt-3 border-stroke-soft-100 border-t pt-2">
												<p className="font-medium text-sm text-text-sub-600">
													{nextCard?.message}{" "}
													<span className="font-semibold text-text-strong-950">
														{nextCard?.highlight}
													</span>
													{nextCard?.extra ? <> {nextCard.extra}</> : "."}
												</p>
											</div>
										</motion.div>
									);
								})()}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
