"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import {
	ORGANIZATION_NAME_MAX_LENGTH,
	organizationNameMaxLengthMessage,
	organizationNameTooLong,
} from "@reloop/auth/organization-limits";
import { APP_NAME_MAX_LENGTH } from "@reloop/auth/setup/setup-limits";
import {
	USER_NAME_PART_MAX_LENGTH,
	userDisplayNamePartsTooLong,
	userNamePartMaxLengthMessage,
} from "@reloop/auth/user-name-limits";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Controller, type Resolver, useForm, useWatch } from "react-hook-form";
import * as v from "valibot";
import { AuthCardHeader } from "#/features/auth/auth-card";
import { authStepVariants } from "#/features/auth/auth-shell";
import { clearClientAuthState } from "#/features/auth/session-query";
import { toastApiError } from "#/lib/rate-limit-toast";
import { completeSetup, SetupRequestError } from "./setup-api";

export const PASSWORD_MIN_LENGTH = 8;
export { APP_NAME_MAX_LENGTH };

const filled = (message: string) =>
	v.check((value: string) => value.trim().length > 0, message);

const keyEntries = {
	adminKey: v.pipe(
		v.string("Setup key is required"),
		filled("Setup key is required"),
	),
};

const accountEntries = {
	name: v.pipe(
		v.string("Name is required"),
		filled("Name is required"),
		v.check(
			(value: string) => !userDisplayNamePartsTooLong(value.trim()),
			userNamePartMaxLengthMessage(),
		),
	),
	email: v.pipe(
		v.string("Email is required"),
		filled("Email is required"),
		v.email("Please enter a valid email address"),
	),
	password: v.pipe(
		v.string("Password is required"),
		v.minLength(
			PASSWORD_MIN_LENGTH,
			`Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
		),
	),
};

const instanceEntries = {
	organizationName: v.pipe(
		v.string(),
		v.check(
			(value: string) => !organizationNameTooLong(value.trim()),
			organizationNameMaxLengthMessage(),
		),
	),
	appName: v.pipe(
		v.string(),
		v.check(
			(value: string) => value.trim().length <= APP_NAME_MAX_LENGTH,
			`Instance name must be ${APP_NAME_MAX_LENGTH} characters or fewer`,
		),
	),
	disableSignup: v.boolean(),
};

const setupSchema = v.object({
	...keyEntries,
	...accountEntries,
	...instanceEntries,
});

type SetupFormData = v.InferInput<typeof setupSchema>;

export const SETUP_STEPS = [
	{
		title: "Unlock setup",
		description: "Paste the key the installer printed.",
		schema: v.object(keyEntries),
		firstField: "adminKey",
	},
	{
		title: "Create the admin account",
		description: "You will sign in with this email and password.",
		schema: v.object(accountEntries),
		firstField: "name",
	},
	{
		title: "Name your instance",
		description: "Both names are optional. Decide who can join.",
		schema: v.object(instanceEntries),
		firstField: "organizationName",
	},
] as const;

const LAST_STEP = SETUP_STEPS.length - 1;

function Field({
	id,
	label,
	optional = false,
	error,
	hint,
	children,
}: {
	id: string;
	label: string;
	optional?: boolean;
	error?: string;
	hint?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={id}
				className="flex items-center justify-between gap-2 font-medium text-[13px] text-text-strong-950"
			>
				{label}
				{optional ? (
					<span className="font-normal text-[12px] text-text-soft-400">
						Optional
					</span>
				) : null}
			</label>
			<Input.Root hasError={!!error} className="rounded-xl!">
				<Input.Wrapper>{children}</Input.Wrapper>
			</Input.Root>
			{error ? (
				<p className="text-error-base text-sm">{error}</p>
			) : hint ? (
				<p className="text-[12px] text-text-soft-400 leading-relaxed">{hint}</p>
			) : null}
		</div>
	);
}

export function SetupForm({
	step,
	direction,
	onStepChange,
}: {
	step: number;
	direction: number;
	onStepChange: (step: number) => void;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { changeStatus, status } = useLoading();
	const [isSuccess, setIsSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const {
		control,
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<SetupFormData>({
		resolver: valibotResolver(setupSchema) as Resolver<SetupFormData>,
		mode: "onChange",
		defaultValues: {
			adminKey: "",
			name: "",
			email: "",
			password: "",
			organizationName: "",
			appName: "",
			disableSignup: true,
		},
	});

	const values = useWatch({ control });
	const current = SETUP_STEPS[step] ?? SETUP_STEPS[0];
	const isLastStep = step === LAST_STEP;

	const isLoading = status === "loading";
	const isBusy = isLoading || isSuccess;
	const canContinue = !isBusy && v.safeParse(current.schema, values).success;

	useEffect(() => {
		document.getElementById(current.firstField)?.focus({ preventScroll: true });
	}, [current.firstField]);

	const onSubmit = async (data: SetupFormData) => {
		try {
			changeStatus("loading");
			await completeSetup({
				adminKey: data.adminKey,
				name: data.name,
				email: data.email,
				password: data.password,
				disableSignup: data.disableSignup,
				organizationName: data.organizationName,
				appName: data.appName,
			});

			clearClientAuthState(queryClient);
			setIsSuccess(true);
			changeStatus("idle");
			window.location.assign("/dashboard");
		} catch (error) {
			changeStatus("idle");

			if (error instanceof SetupRequestError && error.status === 403) {
				setError("adminKey", { type: "server", message: error.message });
				onStepChange(0);
				return;
			}

			if (error instanceof SetupRequestError && error.status === 404) {
				toastApiError(error, error.message);
				router.replace("/login");
				return;
			}

			toastApiError(error, "Setup could not be completed.");
		}
	};

	const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		if (isLastStep) return handleSubmit(onSubmit)(event);
		event.preventDefault();
		if (canContinue) onStepChange(step + 1);
	};

	const inputClassName = "h-11 font-medium text-base";

	return (
		<form onSubmit={onFormSubmit} noValidate>
			<div className="relative">
				<AnimatePresence mode="sync" custom={direction} initial={false}>
					<motion.div
						key={step}
						custom={direction}
						variants={authStepVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
						className="w-full space-y-6"
					>
						<AuthCardHeader
							title={current.title}
							description={current.description}
						/>

						<div className="flex flex-col gap-4">
							{step === 0 ? (
								<Field
									id="adminKey"
									label="Setup key"
									error={errors.adminKey?.message}
									hint={
										<>
											Lost it? Read{" "}
											<code className="rounded-md bg-bg-weak-50 px-1 py-0.5 font-mono text-[11px] text-text-sub-600 dark:bg-white/[0.06]">
												admin-setup.key
											</code>{" "}
											in your install directory.
										</>
									}
								>
									<Icon
										name="key-new"
										className="size-5 shrink-0 text-text-soft-400"
									/>
									<Input.Input
										className="h-11 font-mono text-base placeholder:font-sans"
										id="adminKey"
										type="text"
										autoComplete="off"
										spellCheck={false}
										placeholder="Printed by the installer"
										disabled={isBusy}
										{...register("adminKey")}
									/>
								</Field>
							) : null}

							{step === 1 ? (
								<>
									<Field
										id="name"
										label="Your name"
										error={errors.name?.message}
									>
										<Input.Input
											className={inputClassName}
											id="name"
											type="text"
											autoComplete="name"
											maxLength={USER_NAME_PART_MAX_LENGTH * 2}
											placeholder="Steve Jobs"
											disabled={isBusy}
											{...register("name")}
										/>
									</Field>
									<Field id="email" label="Email" error={errors.email?.message}>
										<Input.Input
											className={inputClassName}
											id="email"
											type="email"
											autoComplete="email"
											placeholder="steve@apple.com"
											disabled={isBusy}
											{...register("email")}
										/>
									</Field>
									<Field
										id="password"
										label="Password"
										error={errors.password?.message}
									>
										<Input.Input
											className={inputClassName}
											id="password"
											type={showPassword ? "text" : "password"}
											autoComplete="new-password"
											placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
											disabled={isBusy}
											{...register("password")}
										/>
										<button
											type="button"
											onClick={() => setShowPassword((previous) => !previous)}
											disabled={isBusy}
											aria-label={
												showPassword ? "Hide password" : "Show password"
											}
											className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:text-text-strong-950 disabled:text-text-disabled-300"
										>
											<Icon
												name={
													showPassword ? "eye-slash-outline" : "eye-outline"
												}
												className="size-5"
											/>
										</button>
									</Field>
								</>
							) : null}

							{step === 2 ? (
								<>
									<Field
										id="organizationName"
										label="Organization"
										optional
										error={errors.organizationName?.message}
										hint="Leave empty to create your first organization later."
									>
										<Input.Input
											className={inputClassName}
											id="organizationName"
											type="text"
											maxLength={ORGANIZATION_NAME_MAX_LENGTH}
											placeholder="Apple"
											disabled={isBusy}
											{...register("organizationName")}
										/>
									</Field>
									<Field
										id="appName"
										label="Instance name"
										optional
										error={errors.appName?.message}
										hint="Shown in system emails after a restart. Defaults to Reloop."
									>
										<Input.Input
											className={inputClassName}
											id="appName"
											type="text"
											maxLength={APP_NAME_MAX_LENGTH}
											placeholder="Reloop"
											disabled={isBusy}
											{...register("appName")}
										/>
									</Field>

									<label
										htmlFor="allowSignup"
										className="flex cursor-pointer select-none items-start justify-between gap-4 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-3 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
									>
										<span className="flex flex-col gap-0.5">
											<span className="font-medium text-[13px] text-text-strong-950">
												Allow public sign-ups
											</span>
											<span className="text-[12px] text-text-sub-600 leading-relaxed">
												Keep this off so only people you invite can join.
											</span>
										</span>
										<Controller
											name="disableSignup"
											control={control}
											render={({ field }) => (
												<Switch.Root
													id="allowSignup"
													checked={!field.value}
													onCheckedChange={(allowed) =>
														field.onChange(!allowed)
													}
													disabled={isBusy}
												/>
											)}
										/>
									</label>

									{values.disableSignup ? null : (
										<output className="flex items-start gap-2.5 rounded-xl border border-warning-base/25 bg-warning-lighter px-3.5 py-3 text-[12px] text-text-sub-600 leading-relaxed dark:border-warning-base/30 dark:bg-warning-base/10">
											<Icon
												name="alert-triangle"
												className="mt-px size-4 shrink-0 text-warning-base"
											/>
											<span>
												Sign-ups stay open: anyone who can reach this URL can
												create an account. You can close them later in the
												instance settings.
											</span>
										</output>
									)}
								</>
							) : null}
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="mt-6 flex gap-2">
				{step > 0 ? (
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						onClick={() => onStepChange(step - 1)}
						disabled={isBusy}
						aria-label="Back"
						className="size-11 shrink-0 rounded-xl"
					>
						<Button.Icon as={Icon} name="arrow-left" />
					</Button.Root>
				) : null}
				<FancyButton.Root
					type="submit"
					variant={isSuccess ? "success" : "blue"}
					size="medium"
					disabled={!canContinue}
					className={`h-11 min-w-0 flex-1 justify-center gap-2 overflow-hidden rounded-xl font-medium text-sm transition-colors duration-200 ${
						isSuccess ? "pointer-events-none cursor-default" : ""
					}`}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={
								isSuccess
									? "success"
									: isLoading
										? "creating"
										: isLastStep
											? "create-admin"
											: "continue"
							}
							transition={{ type: "spring", duration: 0.25, bounce: 0 }}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center justify-center gap-1.5"
						>
							{isLoading && <Spinner size={14} color="currentColor" />}
							{isSuccess && (
								<Icon name="check-circle" className="h-4 w-4 shrink-0" />
							)}
							<span>
								{isSuccess
									? "Setup complete! Redirecting…"
									: isLoading
										? "Creating your account…"
										: isLastStep
											? "Create admin account"
											: "Continue"}
							</span>
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</form>
	);
}
