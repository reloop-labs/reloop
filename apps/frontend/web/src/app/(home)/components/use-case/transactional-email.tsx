"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const cardsData = [
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
		message: "Order confirmation sent to",
		highlight: "acma@reloop.com",
	},
	{
		id: 3,
		title: "Account Verification",
		icon: "verified",
		color: "information-base",
		borderColor: "border-information-base/50",
		iconBg: "bg-information-base/20",
		iconColor: "text-information-base",
		message: "Account verification sent to",
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
		message: "Payment receipt sent to",
		highlight: "acma@reloop.com",
	},
];

type CardProps = {
	card: (typeof cardsData)[number] & { uniqueId?: string };
};

const Card = ({ card }: CardProps) => {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -100 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{
				layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
				opacity: { duration: 0.3, ease: "easeOut" },
				y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
			}}
			className={`rounded-2xl border ${card.borderColor || "border-verified-base/50"} bg-bg-white-0 px-4 py-3`}
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
				</p>
			</div>
		</motion.div>
	);
};

type CardWithId = (typeof cardsData)[number] & { uniqueId: string };

export const TransactionalEmail = () => {
	const [cards, setCards] = useState<CardWithId[]>(() =>
		cardsData.map((card, index) => ({
			...card,
			uniqueId: `${card.id}-${Date.now()}-${index}`,
		})),
	);
	const currentIndexRef = useRef(0);

	useEffect(() => {
		const interval = setInterval(() => {
			currentIndexRef.current =
				(currentIndexRef.current + 1) % cardsData.length;
			setCards((prevCards) => {
				const cardData = cardsData[currentIndexRef.current];
				if (!cardData) return prevCards;
				const newCard: CardWithId = {
					...cardData,
					uniqueId: `${cardData.id}-${Date.now()}`,
				};
				const updatedCards = [newCard, ...prevCards];
				// When it reaches 20 cards, remove the last 10 elements
				if (updatedCards.length >= 20) {
					return updatedCards.slice(0, 10);
				}
				return updatedCards;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative flex flex-col border-stroke-soft-100 border-b">
			<div className="flex w-full items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
				<span className="text-sm text-text-sub-600">1/4</span>
				<span className="text-sm text-text-sub-600">/transaction</span>
			</div>
			<div className="relative flex w-full border-stroke-soft-100">
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
					<div className="relative mx-auto max-w-xl p-16">
						<div className="relative max-h-72 overflow-hidden">
							<div className="relative space-y-4">
								<AnimatePresence mode="popLayout" initial={false}>
									{cards.map((card) => {
										return <Card key={card.uniqueId} card={card} />;
									})}
								</AnimatePresence>
							</div>
							<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t from-bg-white-0 to-bg-white-0/0" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
