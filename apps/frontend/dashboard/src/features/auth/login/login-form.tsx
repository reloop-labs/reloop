import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Input from "@reloop/ui/input";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import {
	getRateLimitInfo,
	showRateLimitCountdownToast,
	toastApiError,
} from "#/lib/rate-limit-toast";

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

const loginSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
});

type LoginFormData = v.InferInput<typeof loginSchema>;

/** Shared form id so the persistent Login button can submit this form. */
export const LOGIN_EMAIL_FORM_ID = "login-email-form";

export function LoginForm({
	disabled = false,
	onLoadingChange,
	onCanSubmitChange,
}: {
	/** Disable the form (e.g. while a social provider is loading). */
	disabled?: boolean;
	/** Notify parent when email submit loading state changes. */
	onLoadingChange?: (loading: boolean) => void;
	/** Notify parent when the form is ready to submit (for shared CTA). */
	onCanSubmitChange?: (canSubmit: boolean) => void;
}) {
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
		defaultValues: {
			email: "",
		},
	});
	const emailField = register("email");

	const isBusy = status === "loading" || disabled;
	const canSubmit = isValid && !isBusy;

	// Refs avoid re-running effects when parents pass inline callbacks (infinite setState loop).
	const onCanSubmitChangeRef = useRef(onCanSubmitChange);
	const onLoadingChangeRef = useRef(onLoadingChange);
	onCanSubmitChangeRef.current = onCanSubmitChange;
	onLoadingChangeRef.current = onLoadingChange;

	useEffect(() => {
		onCanSubmitChangeRef.current?.(canSubmit);
	}, [canSubmit]);

	useEffect(() => {
		onLoadingChangeRef.current?.(status === "loading");
	}, [status]);

	const onSubmit = async (data: LoginFormData) => {
		try {
			clearErrors("email");
			changeStatus("loading");
			const email = data.email;
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});
			if (error) {
				// Stay on the login step and show the failure inline under the
				// email field (e.g. suspended accounts) — no OTP screen, and
				// for suspended users no email was sent at all.
				const message = getServerMessage(
					error,
					"Could not send the login code.",
				);
				setError("email", { message });
				const rateLimit = getRateLimitInfo(error);
				if (rateLimit) {
					showRateLimitCountdownToast(rateLimit);
				}
				changeStatus("idle");
				return;
			}
			setOtpSentEmail(email);
			changeStatus("idle");
		} catch (e) {
			changeStatus("idle");
			setError("email", {
				message: getServerMessage(e, "An unexpected error occurred."),
			});
			toastApiError(e, "An unexpected error occurred.");
		}
	};

	return (
		<form
			id={LOGIN_EMAIL_FORM_ID}
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4"
		>
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="email"
					className="font-medium text-[13px] text-text-strong-950"
				>
					Email
				</label>
				<Input.Root hasError={!!errors.email} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
							id="email"
							type="email"
							placeholder="steve@apple.com"
							disabled={isBusy}
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
			{/* Primary CTA lives on the page (shared with OTP confirm). */}
		</form>
	);
}
