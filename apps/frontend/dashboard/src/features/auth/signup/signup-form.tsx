import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Input from "@reloop/ui/input";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { toastApiError } from "#/lib/rate-limit-toast";

const signupSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
});

type SignupFormData = v.InferInput<typeof signupSchema>;

/** Shared form id so the persistent Create account button can submit this form. */
export const SIGNUP_EMAIL_FORM_ID = "signup-email-form";

export function SignupForm({
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
		formState: { errors, isValid },
	} = useForm<SignupFormData>({
		resolver: valibotResolver(signupSchema) as Resolver<SignupFormData>,
		mode: "onChange",
		defaultValues: {
			email: "",
		},
	});

	const isBusy = status === "loading" || disabled;
	const canSubmit = isValid && !isBusy;

	useEffect(() => {
		onCanSubmitChange?.(canSubmit);
	}, [canSubmit, onCanSubmitChange]);

	useEffect(() => {
		onLoadingChange?.(status === "loading");
	}, [status, onLoadingChange]);

	const onSubmit = async (data: SignupFormData) => {
		try {
			changeStatus("loading");
			const email = data.email;
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});
			if (error) {
				toastApiError(error, "Could not send the signup code.");
				changeStatus("idle");
				return;
			}
			setOtpSentEmail(email);
			changeStatus("idle");
		} catch (e) {
			changeStatus("idle");
			toastApiError(e, "An unexpected error occurred.");
		}
	};

	return (
		<form
			id={SIGNUP_EMAIL_FORM_ID}
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
							className="h-10 font-medium"
							id="email"
							type="email"
							placeholder="steve@apple.com"
							disabled={isBusy}
							{...register("email")}
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
