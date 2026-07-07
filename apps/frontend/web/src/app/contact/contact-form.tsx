"use client";

import { authClient } from "@reloop/auth/client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { contactEmail } from "@reloop/web/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const contactSchema = v.object({
	message: v.pipe(
		v.string("Message is required"),
		v.minLength(10, "Message must be at least 10 characters"),
	),
});

type ContactFormData = v.InferInput<typeof contactSchema>;

function LoginPrompt() {
	return (
		<div className="space-y-5">
			<p className="text-[15px] text-text-sub-600 dark:text-white/45">
				Tell us how we can help
			</p>
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-6 py-10 text-center dark:border-white/[0.08] dark:bg-[#161616]">
				<p className="text-[15px] text-text-sub-600 leading-relaxed dark:text-white/45">
					Log in to your Reloop account so we can help you faster:
				</p>
				<Link
					href="/dashboard/login"
					className={`${Button.buttonVariants({
						variant: "neutral",
						mode: "filled",
					}).root()} mt-6 inline-flex h-9! rounded-full! px-5! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
				>
					Log in
				</Link>
			</div>
			<p className="text-[14px] text-text-sub-600 dark:text-white/45">
				Or email us at{" "}
				<a
					href={`mailto:${contactEmail}`}
					className="text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
				>
					{contactEmail}
				</a>
			</p>
		</div>
	);
}

function SupportForm() {
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

	if (isSubmitted) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex min-h-[280px] flex-col items-center justify-center text-center"
			>
				<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-base/10">
					<svg
						className="size-7 text-primary-base"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<polyline points="4 12 9 17 20 6" />
					</svg>
				</div>
				<h3 className="font-medium text-lg text-text-strong-950 dark:text-white">
					Message sent
				</h3>
				<p className="mt-2 max-w-sm text-[14px] text-text-sub-600 dark:text-white/45">
					Thanks for reaching out. We&apos;ll get back to you within a few
					business days.
				</p>
			</motion.div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<div>
				<h2 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
					Tell us how we can help
				</h2>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/45">
					Please share any relevant information we may need to answer your
					question.
				</p>
			</div>

			<div>
				<Textarea.Root
					id="message"
					placeholder="How do I…"
					rows={6}
					hasError={!!errors.message}
					className="min-h-28 text-[15px] text-text-strong-950 dark:text-white"
					{...register("message")}
				/>
				{errors.message && (
					<p className="mt-1.5 text-error-base text-xs">{errors.message.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-[13px] text-text-sub-600 dark:text-white/45">
					You can also email us at{" "}
					<a
						href={`mailto:${contactEmail}`}
						className="text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
					>
						{contactEmail}
					</a>
				</p>
				<button
					type="submit"
					disabled={isSubmitting}
					className={`${Button.buttonVariants({
						variant: "neutral",
						mode: "filled",
					}).root()} h-9! shrink-0 rounded-full! px-5! font-medium text-sm! disabled:opacity-60 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]`}
				>
					{isSubmitting ? <Spinner size={16} /> : "Send message"}
				</button>
			</div>
		</form>
	);
}

function ContactPanelContent() {
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || isPending) {
		return (
			<div className="min-h-[280px] animate-pulse rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/[0.08] dark:bg-[#161616]" />
		);
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={session ? "form" : "login"}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				{session ? <SupportForm /> : <LoginPrompt />}
			</motion.div>
		</AnimatePresence>
	);
}

export function ContactPanel() {
	return <ContactPanelContent />;
}
