"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type StackEmail = {
	id: string;
	from: string;
	initial: string;
	mark: string;
	heading: string;
	body: string;
	cta: string;
	accent: string;
};

const EMAILS: StackEmail[] = [
	{
		id: "welcome",
		from: "Acme",
		initial: "A",
		mark: "onboarding@acme.dev",
		heading: "Welcome to Acme",
		body: "Hi Maya — your workspace is ready. Confirm your email and send the first message in a few lines of code.",
		cta: "Confirm email",
		accent: "bg-text-strong-950 text-white dark:bg-white dark:text-black",
	},
	{
		id: "reset",
		from: "Acme Security",
		initial: "A",
		mark: "security@acme.dev",
		heading: "Reset your password",
		body: "Hi Alex — we got a request to reset your password. This link expires in 20 minutes. If you didn’t ask, ignore this.",
		cta: "Choose a new password",
		accent: "bg-[#111827] text-white dark:bg-white dark:text-black",
	},
	{
		id: "invoice",
		from: "Acme Billing",
		initial: "A",
		mark: "billing@acme.dev",
		heading: "Invoice #2049 is paid",
		body: "Thanks, Drew. $240.00 hit the account. A PDF receipt is attached if you need it for books.",
		cta: "Download receipt",
		accent: "bg-emerald-700 text-white dark:bg-emerald-400 dark:text-black",
	},
	{
		id: "shipped",
		from: "Acme",
		initial: "A",
		mark: "orders@acme.dev",
		heading: "Your order is on the way",
		body: "Jordan, the kit left the warehouse. Tracking updates as it moves. Most deliveries land in two days.",
		cta: "Track package",
		accent: "bg-blue-700 text-white dark:bg-blue-400 dark:text-black",
	},
	{
		id: "otp",
		from: "Acme",
		initial: "A",
		mark: "noreply@acme.dev",
		heading: "Your sign-in code",
		body: "Elena, use 849-201 to finish signing in. It expires in 10 minutes. Don’t share it with anyone.",
		cta: "Open the app",
		accent: "bg-violet-700 text-white dark:bg-violet-400 dark:text-black",
	},
];

const SWIPE_PX = 88;
const SWIPE_VELOCITY = 650;

export function EmailStack() {
	const [deck, setDeck] = useState(EMAILS);
	const [exitX, setExitX] = useState(0);
	const reduceMotion = useReducedMotion();
	const visible = deck.slice(0, 3);
	const front = visible[0];

	const advance = (direction: number) => {
		if (!front) return;
		setExitX(direction * 280);
		setDeck((current) => [...current.slice(1), current[0]!]);
	};

	return (
		<div className="relative mx-auto h-[24.5rem] w-full max-w-[22rem]">
			<AnimatePresence initial={false}>
				{visible.map((email, index) => {
					const isFront = index === 0;
					return (
						<motion.article
							key={email.id}
							className={cn(
								"absolute inset-x-0 top-0 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#141414]",
								isFront
									? "cursor-grab shadow-[0_24px_60px_rgba(15,23,42,0.16)] active:cursor-grabbing dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
									: "shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
							)}
							style={{ zIndex: 20 - index, touchAction: "pan-y" }}
							initial={false}
							animate={
								isFront
									? { scale: 1, y: 0, opacity: 1 }
									: {
											scale: 1 - index * 0.05,
											y: index * 18,
											opacity: 1,
										}
							}
							exit={
								reduceMotion
									? { opacity: 0 }
									: {
											x: exitX || 240,
											opacity: 0,
											rotate: exitX > 0 ? 8 : -8,
										}
							}
							transition={{
								type: "spring",
								duration: 0.38,
								bounce: 0.12,
							}}
							drag={isFront && !reduceMotion ? "x" : false}
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={0.82}
							onDragEnd={(_, info) => {
								if (!isFront) return;
								const shouldGo =
									Math.abs(info.offset.x) > SWIPE_PX ||
									Math.abs(info.velocity.x) > SWIPE_VELOCITY;
								if (shouldGo) {
									advance(info.offset.x >= 0 ? 1 : -1);
								}
							}}
							onClick={() => {
								if (isFront && reduceMotion) advance(1);
							}}
						>
							<EmailBody email={email} />
						</motion.article>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

function EmailBody({ email }: { email: StackEmail }) {
	return (
		<div className="px-5 pt-5 pb-6">
			<div className="flex items-center gap-2.5">
				<span
					className={cn(
						"flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-[13px]",
						email.accent,
					)}
				>
					{email.initial}
				</span>
				<div className="min-w-0">
					<p className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
						{email.from}
					</p>
					<p className="truncate text-[11px] text-text-soft-400 dark:text-white/40">
						{email.mark}
					</p>
				</div>
			</div>
			<h3 className="mt-5 font-semibold text-[1.2rem] text-text-strong-950 leading-snug tracking-tight dark:text-white">
				{email.heading}
			</h3>
			<p className="mt-2 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
				{email.body}
			</p>
			<span
				className={cn(
					"mt-5 inline-flex items-center rounded-lg px-4 py-2 font-medium text-[12.5px]",
					email.accent,
				)}
			>
				{email.cta}
			</span>
		</div>
	);
}
