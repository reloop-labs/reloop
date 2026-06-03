"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const contactSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
	message: v.pipe(
		v.string("Message is required"),
		v.minLength(10, "Message must be at least 10 characters"),
	),
});

type ContactFormData = v.InferInput<typeof contactSchema>;

export function ContactForm() {
	const [isSubmitted, setIsSubmitted] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormData>({
		resolver: valibotResolver(contactSchema) as Resolver<ContactFormData>,
		mode: "onChange",
	});

	const onSubmit = async (data: ContactFormData) => {
		// TODO: wire to a contact API or email service
		console.log("Submitting:", data);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsSubmitted(true);
	};

	const successVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut" as const,
			},
		},
	};

	const checkmarkVariants = {
		hidden: { pathLength: 0, opacity: 0 },
		visible: {
			pathLength: 1,
			opacity: 1,
			transition: {
				duration: 0.5,
				delay: 0.2,
				ease: "easeOut" as const,
			},
		},
	};

	return (
		<AnimatePresence mode="wait">
			{isSubmitted ? (
				<motion.div
					key="success"
					variants={successVariants}
					initial="hidden"
					animate="visible"
					className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"
				>
					<motion.div
						className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary-base/10"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.4, ease: "backOut" }}
					>
						<motion.svg
							className="size-8 text-primary-base"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<motion.polyline
								points="4 12 9 17 20 6"
								variants={checkmarkVariants}
								initial="hidden"
								animate="visible"
							/>
						</motion.svg>
					</motion.div>
					<motion.h3
						className="font-semibold text-text-strong-950 text-xl dark:text-white"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						Message sent!
					</motion.h3>
					<motion.p
						className="mt-2 text-text-sub-600 dark:text-white/50"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						We&apos;ll get back to you within a few business days.
					</motion.p>
				</motion.div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label
							htmlFor="email"
							className="block font-medium text-sm text-text-strong-950 dark:text-white"
						>
							Email address
						</label>
						<div className="mt-2">
							<Input.Root size="medium" hasError={!!errors.email}>
								<Input.Wrapper>
									<Input.Input
										id="email"
										type="email"
										placeholder="you@example.com"
										className="text-base"
										{...register("email")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						{errors.email && (
							<p className="mt-1.5 text-error-base text-xs">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="message"
							className="block font-medium text-sm text-text-strong-950 dark:text-white"
						>
							How can we help?
						</label>
						<div className="mt-2">
							<Textarea.Root
								simple
								id="message"
								className="text-base"
								placeholder="Hosted service, self-hosting, licensing, or anything else…"
								hasError={!!errors.message}
								{...register("message")}
							/>
						</div>
						{errors.message && (
							<p className="mt-1.5 text-error-base text-xs">
								{errors.message.message}
							</p>
						)}
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "filled",
							}).root()} h-11! w-full rounded-2xl! px-8! font-semibold disabled:opacity-60`}
						>
							{isSubmitting ? <Spinner size={16} /> : "Send message"}
						</button>
					</div>
				</form>
			)}
		</AnimatePresence>
	);
}
