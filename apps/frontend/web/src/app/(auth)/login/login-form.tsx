"use client";

import { authClient } from "@auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Button from "@ui/components/button";
import * as Divider from "@ui/components/divider";
import { Icon } from "@ui/components/icon";
import * as Input from "@ui/components/input";
import * as Label from "@ui/components/label";
import * as LinkButton from "@ui/components/link-button";
import Spinner from "@ui/components/spinner";
import { useLoading } from "@ui/hooks/use-loading";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { changeStatus, status } = useLoading();

	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		setError,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: "onChange",
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			changeStatus("loading");
			const auth = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			});

			if (auth.error) {
				changeStatus("idle");
				if (auth.error.code === "INVALID_EMAIL_OR_PASSWORD") {
					setError("email", {
						type: "manual",
						message: "Invalid email or password",
					});
				} else {
					toast.error(auth.error.message);
				}
				return;
			}
			router.push("/dashboard");
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
								className="h-12 font-medium"
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
					<div className="flex items-center gap-1">
						<p className="text-paragraph-sm text-text-sub-600">
							Forgot password?
						</p>
						<LinkButton.Root variant="black">Reset it</LinkButton.Root>
					</div>
				</div>
				<Button.Root
					type="submit"
					disabled={status === "loading" || !isValid}
					variant="neutral"
					className="mt-4 h-12 w-full"
				>
					{status === "loading" && <Spinner color="var(--text-strong-950)" />}
					{status === "loading" ? "Signing in..." : "Sign in"}
				</Button.Root>
			</form>
		</motion.div>
	);
};
