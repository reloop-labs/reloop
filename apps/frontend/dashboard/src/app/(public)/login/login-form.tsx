"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const loginSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
});

type LoginFormData = v.InferInput<typeof loginSchema>;

export const LoginForm = () => {
	const { changeStatus, status } = useLoading();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<LoginFormData>({
		resolver: valibotResolver(loginSchema) as Resolver<LoginFormData>,
		mode: "onChange",
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			changeStatus("loading");
			// TODO: Implement OTP sending logic
			toast.success("OTP sent to your email!");
			// For now, just a placeholder success
			changeStatus("idle");
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
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<Input.Root hasError={!!errors.email}>
					<Input.Wrapper className="rounded-2xl!">
						<Input.Input
							className="h-12 font-medium"
							id="email"
							type="email"
							placeholder="steve@apple.com"
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
				className="mt-2 h-12 w-full rounded-2xl!"
			>
				{status === "loading" && <Spinner color="var(--text-strong-950)" />}
				{status === "loading" ? "Continuing..." : "Continue with email"}
			</Button.Root>
		</form>
	);
};
