"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { motion, type Variants } from "motion/react";

interface EmptyStateProps {
	onCreateApiKey: () => void;
}

// Animation variants with proper typing
const floatOrbVariants: Variants = {
	animate: {
		y: [0, -8, 0],
		transition: {
			duration: 3,
			ease: "easeInOut",
			repeat: Infinity,
		},
	},
};

const pulseVariants: Variants = {
	animate: {
		opacity: [0.5, 1, 0.5],
		scale: [1, 1.05, 1],
		transition: {
			duration: 2,
			ease: "easeInOut",
			repeat: Infinity,
		},
	},
};

const iconWiggleVariants: Variants = {
	animate: {
		rotate: [0, -12, 10, -8, 5, -3, 0],
		scale: [1, 1.05, 1.02, 1.03, 1, 1, 1],
		transition: {
			duration: 4,
			ease: "easeInOut",
			repeat: Infinity,
		},
	},
};

const floatParticleVariants: Variants = {
	animate: {
		y: [0, -6, -10, -4, 0],
		x: [0, 3, -2, 4, 0],
		scale: [1, 1.2, 0.8, 1.1, 1],
		opacity: [0.6, 1, 0.8, 0.5, 0.6],
		transition: {
			duration: 3,
			ease: "easeInOut",
			repeat: Infinity,
		},
	},
};

const fadeInUpVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: (delay: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			delay,
			ease: "easeOut",
		},
	}),
};

export const EmptyState = ({ onCreateApiKey }: EmptyStateProps) => {
	return (
		<motion.div
			className="flex flex-col items-center justify-center h-[calc(100dvh-300px)]"
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative mb-8 flex items-center justify-center">
				{/* Left side floating orbs */}
				<div className="absolute -left-24 -top-4 flex flex-col gap-3 items-end">
					<motion.div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						variants={floatOrbVariants}
						animate="animate"
					/>
					<motion.div
						className="h-3 w-3 rounded-full bg-neutral-alpha-16 -mr-2"
						variants={floatOrbVariants}
						animate="animate"
					/>
				</div>

				{/* Center icon container */}
				<div className="relative">
					<motion.div
						className="absolute -top-3 -left-3 h-16 w-16 rounded-full bg-neutral-alpha-10"
						variants={pulseVariants}
						animate="animate"
					/>
					<motion.div
						className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-neutral-alpha-10"
						variants={pulseVariants}
						animate="animate"
					/>
					<div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-stroke-soft-200/50 bg-bg-white-0 shadow-regular-md group">
						<div className="relative">
							<motion.div
								className="absolute inset-0 blur-xl rounded-full bg-primary-alpha-16"
								variants={pulseVariants}
								animate="animate"
							/>
							{/* Key icon with wiggle animation */}
							<motion.div variants={iconWiggleVariants} animate="animate">
								<Icon
									name="key-new"
									className="relative h-10 w-10 text-natural-base"
								/>
							</motion.div>
						</div>
					</div>
					<motion.div
						className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-alpha-24"
						variants={floatParticleVariants}
						animate="animate"
					/>
					<motion.div
						className="absolute bottom-4 left-0 h-1.5 w-1.5 rounded-full bg-primary-alpha-16"
						variants={floatParticleVariants}
						animate="animate"
					/>
				</div>

				{/* Right side floating orbs - mirroring left side */}
				<div className="absolute -right-24 flex flex-col gap-3 items-start">
					<motion.div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						variants={floatOrbVariants}
						animate="animate"
					/>
					<motion.div
						className="h-3 w-3 rounded-full bg-neutral-alpha-16 -ml-2"
						variants={floatOrbVariants}
						animate="animate"
					/>
				</div>
			</div>

			{/* Content */}
			<div className="flex max-w-md flex-col items-center text-center">
				<motion.h3
					className="mb-2 font-semibold text-text-strong-950 text-xl"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.15}
				>
					No API keys yet
				</motion.h3>
				<motion.p
					className="mb-2 text-text-sub-600 text-sm"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.25}
				>
					API keys allow you to authenticate requests to your application programmatically.
				</motion.p>
				<motion.p
					className="mb-6 text-text-soft-400 text-xs"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.35}
				>
					Create your first API key to get started with the API.
				</motion.p>

				{/* CTA */}
				<motion.div
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.45}
				>
					<Button.Root variant="neutral" size="small" onClick={onCreateApiKey}>
						<Icon name="plus" className="h-4 w-4" />
						Create your first API key
					</Button.Root>
				</motion.div>

				{/* Help link */}
				<motion.a
					href="https://reloop.sh/docs/api-keys"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.55}
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about API keys
				</motion.a>
			</div>
		</motion.div>
	);
};
