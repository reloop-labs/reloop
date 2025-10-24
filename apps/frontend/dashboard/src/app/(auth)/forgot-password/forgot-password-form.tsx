"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { motion } from "motion/react";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const forgotPasswordSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
});

type ForgotPasswordFormData = v.InferInput<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
	const [emailSent, setEmailSent] = useState(false);
	const { changeStatus, status } = useLoading();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ForgotPasswordFormData>({
		resolver: valibotResolver(
			forgotPasswordSchema,
		) as Resolver<ForgotPasswordFormData>,
		mode: "onChange",
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			changeStatus("loading");
			const result = await authClient.requestPasswordReset({
				email: data.email,
				redirectTo: `${window.location.origin}/dashboard/reset-password`,
			});

			if (result.error) {
				changeStatus("idle");
				return;
			}

			setEmailSent(true);
		} catch (e) {
			changeStatus("idle");
			if (e instanceof Error && e.message) {
			} else {
				// Handle unexpected error
			}
		}
	};

	if (emailSent) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-4 text-center"
			>
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8 text-success-600"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<div className="space-y-2">
					<h3 className="title-h6 text-text-strong-950">Check your email</h3>
					<p className="text-paragraph-sm text-text-sub-600">
						We've sent a password reset link to your email address. Please check
						your inbox and follow the instructions to reset your password.
					</p>
				</div>
				<Button.Root
					onClick={() => {
						setEmailSent(false);
						changeStatus("idle");
					}}
					variant="neutral"
					mode="stroke"
					className="h-12 w-full"
				>
					Send another email
				</Button.Root>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, height: 0, y: -20 }}
			animate={{ opacity: 1, height: "auto", y: 0 }}
			exit={{ opacity: 0, height: 0, y: -20 }}
			transition={{ duration: 0.2 }}
			className="space-y-4"
		>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="email">
						Email Address <Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.email}>
						<Input.Wrapper>
							<Input.Input
								className="h-12 font-medium"
								id="email"
								type="email"
								placeholder="hello@reloop.com"
								{...register("email")}
							/>
						</Input.Wrapper>
					</Input.Root>
					{errors.email && (
						<p className="text-error-base text-sm">{errors.email.message}</p>
					)}
				</div>

				<Button.Root
					type="submit"
					disabled={status === "loading" || !isValid}
					variant="neutral"
					className="mt-4 h-12 w-full"
				>
					{status === "loading" && <Spinner color="var(--text-strong-950)" />}
					{status === "loading" ? "Sending..." : "Send Reset Password Email"}
				</Button.Root>
			</form>
		</motion.div>
	);
};
