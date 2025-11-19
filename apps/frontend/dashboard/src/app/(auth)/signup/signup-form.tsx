"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as Divider from "@reloop/ui/divider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { generateId } from "better-auth";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const signupSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
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

type SignupFormData = v.InferInput<typeof signupSchema>;

export const SignupForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { changeStatus, status } = useLoading();

	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		setError,
	} = useForm<SignupFormData>({
		resolver: valibotResolver(signupSchema) as Resolver<SignupFormData>,
		mode: "onChange",
	});

	const onSubmit = async (data: SignupFormData) => {
		// Manual password confirmation validation
		if (data.password !== data.confirmPassword) {
			setError("confirmPassword", {
				type: "manual",
				message: "Passwords don't match",
			});
			return;
		}

		try {
			changeStatus("loading");
			const name = data.email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") ?? "";
			const mode = "dev";
			const organizationSlug = `${name.replace(/\s+/g, "-").toLowerCase()}-${generateId()}`;
			const auth = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name,
				activeOrganizationId: organizationSlug,
				mode,
			});
			if (auth.error) {
				changeStatus("idle");
				if (auth.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
					setError("email", {
						type: "manual",
						message: auth.error.message,
					});
				} else {
					toast.error(auth.error.message);
				}

				return;
			}
			const org = await authClient.organization.create({
				name,
				slug: organizationSlug,
				keepCurrentActiveOrganization: true,
			});
			if (org.error) {
				changeStatus("idle");
				toast.error(org.error.message);
				return;
			}
			await authClient.updateUser({ activeOrganizationId: org.data.id });
			router.push(`/${org.data.slug}`);
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
			transition={{
				duration: 0.3,
				ease: "easeOut",
				opacity: { duration: 0.2 },
				height: { duration: 0.3 },
			}}
			className="overflow-hidden"
		>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
				<Divider.Root variant="line-text">OR</Divider.Root>

				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="email">
						Email Address
						<Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.email}>
						<Input.Wrapper>
							<Input.Input
								className="h-11 font-medium"
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

				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="password">
						Password <Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.password}>
						<Input.Wrapper>
							<Input.Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••"
								className="h-11 font-medium"
								{...register("password")}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								className="flex items-center justify-center"
							>
								{showPassword ? (
									<Icon
										name="eye-outline"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
									/>
								) : (
									<Icon
										name="eye-slash-outline"
										className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
									/>
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
						Confirm Password <Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.confirmPassword}>
						<Input.Wrapper>
							<Input.Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••••"
								className="h-11 font-medium"
								{...register("confirmPassword")}
							/>
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
					className="mt-4 h-11 w-full"
				>
					{status === "loading" && <Spinner color="var(--text-strong-950)" />}
					{status === "loading" ? "Creating account..." : "Sign up"}
				</Button.Root>
			</form>
		</motion.div>
	);
};
