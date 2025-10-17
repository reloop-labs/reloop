"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const resetPasswordSchema = v.object({
	password: v.pipe(
		v.string("Password is required"),
		v.minLength(1, "Password is required"),
		v.minLength(8, "Password must be at least 8 characters"),
		v.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one lowercase letter, one uppercase letter, and one number",
		),
	),
	confirmPassword: v.pipe(
		v.string("Please confirm your password"),
		v.minLength(1, "Please confirm your password"),
	),
});

type ResetPasswordFormData = v.InferInput<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { changeStatus, status } = useLoading();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		setError,
	} = useForm<ResetPasswordFormData>({
		resolver: valibotResolver(
			resetPasswordSchema,
		) as Resolver<ResetPasswordFormData>,
		mode: "onChange",
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		// Manual password confirmation validation
		if (data.password !== data.confirmPassword) {
			setError("confirmPassword", {
				type: "manual",
				message: "Passwords don't match",
			});
			return;
		}

		if (!token) {
			toast.error("Invalid reset link. Please request a new one.");
			return;
		}

		try {
			changeStatus("loading");
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token,
			});

			if (result.error) {
				changeStatus("idle");
				toast.error(result.error.message);
				return;
			}

			toast.success("Password reset successfully! You can now sign in.");
			router.push("/login");
		} catch (e) {
			changeStatus("idle");
			if (e instanceof Error && e.message) {
				toast.error(e.message);
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

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
					<Label.Root htmlFor="password">
						New Password <Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.password}>
						<Input.Wrapper>
							<Input.Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••"
								className="h-12 font-medium"
								{...register("password")}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								className="flex items-center justify-center"
							>
								{showPassword ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
										/>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
										/>
									</svg>
								)}
							</button>
						</Input.Wrapper>
					</Input.Root>
					{errors.password && (
						<p className="text-error-base text-sm">{errors.password.message}</p>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="confirmPassword">
						Confirm New Password <Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.confirmPassword}>
						<Input.Wrapper>
							<Input.Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="••••••••••"
								className="h-12 font-medium"
								{...register("confirmPassword")}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword((s) => !s)}
								className="flex items-center justify-center"
							>
								{showConfirmPassword ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
										/>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
										/>
									</svg>
								)}
							</button>
						</Input.Wrapper>
					</Input.Root>
					{errors.confirmPassword && (
						<p className="text-error-base text-sm">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button.Root
					type="submit"
					disabled={status === "loading" || !isValid}
					variant="neutral"
					className="mt-4 h-12 w-full"
				>
					{status === "loading" && <Spinner color="var(--text-strong-950)" />}
					{status === "loading" ? "Resetting password..." : "Reset Password"}
				</Button.Root>
			</form>
		</motion.div>
	);
};
