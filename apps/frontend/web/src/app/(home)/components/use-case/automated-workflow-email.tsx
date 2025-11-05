"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useState } from "react";

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
	cardDelay: number;
};

const Card = ({ card, cardDelay }: CardProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{
				delay: cardDelay,
				duration: 0.8,
				ease: [0.4, 0, 0.2, 1],
			}}
			className={`rounded-2xl border ${card.borderColor || "border-verified-base/50"} bg-bg-white-0 px-4 py-3`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<motion.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{
							duration: 0.6,
							delay: cardDelay + 0.1,
							ease: [0.34, 1.56, 0.64, 1],
						}}
						className={`flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 ${card.iconBg || "bg-verified-base/20"}`}
					>
						<Icon
							name={card.icon || "route"}
							className={`h-3 w-3 ${card.iconColor || "text-verified-base"}`}
						/>
					</motion.div>
					<p className="font-semibold text-sm">{card.title}</p>
				</div>
				<p className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs">
					{card.subtitle}
				</p>
			</div>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: cardDelay + 0.3, duration: 0.5 }}
				className="mt-3 border-stroke-soft-100 border-t pt-2"
			>
				<p className="font-medium text-sm text-text-sub-600">
					{card.message}{" "}
					<span className="font-semibold text-text-strong-950">
						{card.highlight}
					</span>
				</p>
			</motion.div>
		</motion.div>
	);
};

export const AutomatedWorkflowEmail = () => {
	const [animationKey, setAnimationKey] = useState(0);

	const handleReplay = () => {
		setAnimationKey((prev) => prev + 1);
	};

	return (
		<div className="relative flex flex-col border-stroke-soft-100 border-r border-b">
			<div className="flex w-full items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
				<span className="text-sm text-text-sub-600">2/4</span>
				<span className="text-sm text-text-sub-600">/automation</span>
			</div>
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
					{/* Replay Button */}
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleReplay}
						className="absolute top-4 right-4 z-10"
					>
						<Icon
							name="refresh-cw"
							className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
						/>
					</Button.Root>
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage:
								"radial-gradient(circle at 1px 1px, var(--stroke-soft-100) 1px, transparent 0)",
							backgroundSize: "10px 10px",
						}}
					/>
					<div
						key={animationKey}
						className="relative mx-auto min-h-[600px] max-w-xl p-16"
					>
						{/* New User Signup Badge */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8, y: -20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
							className="flex justify-center"
						>
							<div className="flex w-fit items-center gap-2 rounded-xl border border-success-base/50 bg-bg-white-0 py-2 pr-3 pl-2">
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{
										delay: 0.2,
										duration: 0.6,
										ease: [0.34, 1.56, 0.64, 1],
									}}
									className="flex h-5 w-5 items-center justify-center rounded-sm border border-stroke-soft-100 bg-success-base/20"
								>
									<Icon
										name="user-plus"
										className="h-3 w-3 stroke-1 text-success-base"
									/>
								</motion.div>
								<p className="font-semibold text-xs">New User Signup</p>
							</div>
						</motion.div>

						{/* Initial Connecting Line */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
							className="-mt-1.5"
						>
							<div className="flex flex-col items-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 1.3, duration: 0.5 }}
									className="h-px w-px rounded-full border border-success-base bg-bg-white-0 p-1"
								/>
								<motion.div
									initial={{ scaleY: 0 }}
									animate={{ scaleY: 1 }}
									transition={{
										delay: 1.4,
										duration: 0.6,
										ease: [0.4, 0, 0.2, 1],
									}}
									className="h-10 w-px origin-top border-success-base border-l"
								/>
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1.5, duration: 0.5 }}
								>
									<Icon
										name="chevron-down"
										className="-mt-2.5 h-4 w-4 text-success-base"
									/>
								</motion.div>
							</div>
						</motion.div>

						{/* Workflow Cards */}
						<div className="relative">
							{cardsData.map((card, index) => {
								// Each card appears after previous arrow completes
								// Card duration: 0.8s, pause: 0.2s, Arrow duration: 0.8s
								// Total per card+arrow cycle: 0.8 + 0.2 + 0.8 = 1.8s
								// First card starts at 2.0s (after initial badge + arrow)
								const cardDelay = 2.0 + index * 1.8;
								// Arrow appears after card completes (card duration 0.8s + pause 0.2s)
								const arrowDelay = cardDelay + 0.8 + 0.2;

								return (
									<div key={card.id} className="relative">
										<Card card={card} cardDelay={cardDelay} />
										{index < cardsData.length - 1 && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{
													delay: arrowDelay,
													duration: 0.8,
													ease: [0.4, 0, 0.2, 1],
												}}
												className="flex flex-col items-center"
											>
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{
														delay: arrowDelay + 0.1,
														duration: 0.5,
													}}
													className={`h-px w-px rounded-full border ${card.textColor || "border-verified-base/50"} -mt-1.5 bg-bg-white-0 p-1`}
												/>
												<motion.div
													initial={{ scaleY: 0 }}
													animate={{ scaleY: 1 }}
													transition={{
														delay: arrowDelay + 0.2,
														duration: 0.6,
														ease: [0.4, 0, 0.2, 1],
													}}
													className={`h-10 w-px origin-top border-l ${card.textColor || "border-verified-base/50"}`}
												/>
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														delay: arrowDelay + 0.3,
														duration: 0.5,
													}}
												>
													<Icon
														name="chevron-down"
														className={`-mt-2.5 h-4 w-4 ${card.textColor || "text-verified-base"}`}
													/>
												</motion.div>
											</motion.div>
										)}
									</div>
								);
							})}
						</div>

						{/* Final Connecting Line */}
						{(() => {
							// Last card appears at: 2.0 + (cardsData.length - 1) * 1.8
							const lastCardDelay = 2.0 + (cardsData.length - 1) * 1.8;
							// Final arrow appears after last card completes (card duration 0.8s + pause 0.2s)
							const finalArrowDelay = lastCardDelay + 0.8 + 0.2;
							// Final badge appears after final arrow completes (arrow duration 0.8s + pause 0.2s)
							const finalBadgeDelay = finalArrowDelay + 0.8 + 0.2;

							return (
								<>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{
											delay: finalArrowDelay,
											duration: 0.8,
											ease: [0.4, 0, 0.2, 1],
										}}
									>
										<div className="flex flex-col items-center">
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{
													delay: finalArrowDelay + 0.1,
													duration: 0.5,
												}}
												className="-mt-1.5 z-10 h-px w-px rounded-full border border-verified-base bg-bg-white-0 p-1"
											/>
											<motion.div
												initial={{ scaleY: 0 }}
												animate={{ scaleY: 1 }}
												transition={{
													delay: finalArrowDelay + 0.2,
													duration: 0.6,
													ease: [0.4, 0, 0.2, 1],
												}}
												className="h-10 w-px origin-top border-verified-base border-l"
											/>
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													delay: finalArrowDelay + 0.3,
													duration: 0.5,
												}}
											>
												<Icon
													name="chevron-down"
													className="-mt-2.5 h-4 w-4 text-verified-base"
												/>
											</motion.div>
										</div>
									</motion.div>

									{/* Automation Complete Badge */}
									<motion.div
										initial={{ opacity: 0, scale: 0.8, y: 20 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										transition={{
											delay: finalBadgeDelay,
											duration: 0.8,
											ease: [0.4, 0, 0.2, 1],
										}}
										className="flex justify-center"
									>
										<div className="flex w-fit items-center gap-2 rounded-xl border border-error-base/50 bg-bg-white-0 py-2 pr-3 pl-2">
											<motion.div
												initial={{ scale: 0, rotate: -180 }}
												animate={{ scale: 1, rotate: 0 }}
												transition={{
													delay: finalBadgeDelay + 0.2,
													duration: 0.6,
													ease: [0.34, 1.56, 0.64, 1],
												}}
												className="flex h-5 w-5 items-center justify-center rounded-sm border border-stroke-soft-100 bg-error-base/20"
											>
												<Icon
													name="check-circle"
													className="h-3 w-3 stroke-1 text-error-base"
												/>
											</motion.div>
											<p className="font-semibold text-xs">
												Automation Complete
											</p>
										</div>
									</motion.div>
								</>
							);
						})()}
					</div>
				</div>
			</div>
		</div>
	);
};
