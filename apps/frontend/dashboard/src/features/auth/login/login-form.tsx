import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { toastApiError } from "#/lib/rate-limit-toast";

const loginSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.email("Please enter a valid email address"),
	),
});

type LoginFormData = v.InferInput<typeof loginSchema>;

export function LoginForm({
	disabled = false,
	onLoadingChange,
}: {
	/** Disable the form (e.g. while a social provider is loading). */
	disabled?: boolean;
	/** Notify parent when email submit loading state changes. */
	onLoadingChange?: (loading: boolean) => void;
}) {
	const { changeStatus, status } = useLoading();
	const [, setOtpSentEmail] = useQueryState("otpSent");

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<LoginFormData>({
		resolver: valibotResolver(loginSchema) as Resolver<LoginFormData>,
		mode: "onChange",
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			changeStatus("loading");
			onLoadingChange?.(true);
			const email = data.email;
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});
			if (error) {
				toastApiError(error, "Could not send the login code.");
				changeStatus("idle");
				onLoadingChange?.(false);
				return;
			}
			setOtpSentEmail(email);
			changeStatus("idle");
			onLoadingChange?.(false);
		} catch (e) {
			changeStatus("idle");
			onLoadingChange?.(false);
			toastApiError(e, "An unexpected error occurred.");
		}
	};

	const isBusy = status === "loading" || disabled;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

			<FancyButton.Root
				type="submit"
				disabled={isBusy || !isValid}
				variant="blue"
				size="medium"
				className="h-10 w-full overflow-hidden rounded-xl font-medium text-sm"
			>
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.span
						key={status === "loading" ? "loading" : "idle"}
						transition={{
							type: "spring",
							duration: 0.25,
							bounce: 0,
						}}
						initial={{
							opacity: 0,
							y: -14,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							y: 14,
						}}
						className="flex items-center justify-center gap-1.5"
					>
						{status === "loading" ? (
							<>
								<Spinner size={14} color="currentColor" />
								<span>Signing in…</span>
							</>
						) : (
							<span>Sign in</span>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</form>
	);
}
