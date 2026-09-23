"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryState } from "nuqs";
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

/**
 * Extract a displayable message from a Better Auth client error, which is a
 * plain object (`{ message }`) rather than an `Error` instance.
 */
function getServerMessage(error: unknown, fallback: string): string {
	if (error && typeof error === "object") {
		const err = error as { message?: unknown; error?: unknown };
		if (typeof err.message === "string" && err.message.trim()) {
			return err.message;
		}
		if (typeof err.error === "string" && err.error.trim()) {
			return err.error;
		}
	}
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

export const LoginForm = () => {
	const { changeStatus, status } = useLoading();
	const [, setOtpSentEmail] = useQueryState("otpSent");
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isValid },
	} = useForm<LoginFormData>({
		resolver: valibotResolver(loginSchema) as Resolver<LoginFormData>,
		mode: "onChange",
	});
	const emailField = register("email");

	const onSubmit = async (data: LoginFormData) => {
		try {
			clearErrors("email");
			changeStatus("loading");
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: data.email,
				type: "sign-in",
			});
			const sendError =
				result && typeof result === "object" && "error" in result
					? (result as { error?: unknown }).error
					: null;
			if (sendError) {
				// Stay on the login step and show the failure inline under the
				// email field (e.g. suspended accounts) — no OTP screen, and
				// for suspended users no email was sent at all.
				const message = getServerMessage(
					sendError,
					"Could not send the login code.",
				);
				setError("email", { message });
				toast.error(message);
				changeStatus("idle");
				return;
			}
			if (result) {
				setOtpSentEmail(data.email);
				changeStatus("idle");
			}
		} catch (e) {
			changeStatus("idle");
			const message = getServerMessage(e, "An unexpected error occurred.");
			// Inline on the login page itself so the user sees it in context.
			setError("email", { message });
			toast.error(message);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<Input.Root hasError={!!errors.email} className="rounded-2xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-12 font-medium"
							id="email"
							type="email"
							placeholder="admin@reloop.sh"
							{...emailField}
							onChange={(e) => {
								void emailField.onChange(e);
								if (errors.email) clearErrors("email");
							}}
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
