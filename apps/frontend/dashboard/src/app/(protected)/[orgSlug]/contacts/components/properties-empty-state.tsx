"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { motion, type Variants } from "motion/react";

// Animation variants with proper typing
const floatOrbVariants: Variants = {
	animate: {
		y: [0, -8, 0],
		transition: {
			duration: 3,
			ease: "easeInOut",
			repeat: Number.POSITIVE_INFINITY,
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
			repeat: Number.POSITIVE_INFINITY,
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
			repeat: Number.POSITIVE_INFINITY,
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
			repeat: Number.POSITIVE_INFINITY,
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

interface PropertiesEmptyStateProps {
	onAddProperty?: () => void;
}

export const PropertiesEmptyState = ({
	onAddProperty,
}: PropertiesEmptyStateProps) => {
	return (
		<motion.div
			className="flex h-[calc(100dvh-350px)] flex-col items-center justify-center"
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative mb-8 flex items-center justify-center">
				{/* Left side floating orbs */}
				<div className="-left-24 -top-4 absolute flex flex-col items-end gap-3">
					<motion.div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						variants={floatOrbVariants}
						animate="animate"
					/>
					<motion.div
						className="-mr-2 h-3 w-3 rounded-full bg-neutral-alpha-16"
						variants={floatOrbVariants}
						animate="animate"
					/>
				</div>

				{/* Center icon container */}
				<div className="relative">
					<motion.div
						className="-top-3 -left-3 absolute h-16 w-16 rounded-full bg-neutral-alpha-10"
						variants={pulseVariants}
						animate="animate"
					/>
					<motion.div
						className="-right-2 -bottom-2 absolute h-12 w-12 rounded-full bg-neutral-alpha-10"
						variants={pulseVariants}
						animate="animate"
					/>
					<div className="group relative flex h-20 w-20 items-center justify-center rounded-2xl border border-stroke-soft-200/50 bg-bg-white-0 shadow-regular-md">
						<div className="relative">
							<motion.div
								className="absolute inset-0 rounded-full bg-primary-alpha-16 blur-xl"
								variants={pulseVariants}
								animate="animate"
							/>
							{/* Icon with wiggle animation */}
							<motion.div variants={iconWiggleVariants} animate="animate">
								<Icon
									name="sliders-horiz-2"
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
				<div className="-right-24 absolute flex flex-col items-start gap-3">
					<motion.div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						variants={floatOrbVariants}
						animate="animate"
					/>
					<motion.div
						className="-ml-2 h-3 w-3 rounded-full bg-neutral-alpha-16"
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
					No properties yet
				</motion.h3>
				<motion.p
					className="mb-2 text-sm text-text-sub-600"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.25}
				>
					Properties let you store custom data for each contact.
				</motion.p>
				<motion.p
					className="mb-6 text-text-soft-400 text-xs"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.35}
				>
					Add your first property to personalize your emails.
				</motion.p>

				{/* CTA */}
				<motion.div
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.45}
				>
					<Button.Root variant="neutral" size="small" onClick={onAddProperty}>
						<Icon name="plus" className="h-4 w-4" />
						Add your first property
					</Button.Root>
				</motion.div>

				{/* Help link */}
				<motion.a
					href="https://reloop.sh/docs/properties"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
					variants={fadeInUpVariants}
					initial="hidden"
					animate="visible"
					custom={0.55}
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about properties
				</motion.a>
			</div>
		</motion.div>
	);
};
