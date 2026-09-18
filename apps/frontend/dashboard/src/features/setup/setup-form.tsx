"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import {
	ORGANIZATION_NAME_MAX_LENGTH,
	organizationNameMaxLengthMessage,
	organizationNameTooLong,
} from "@reloop/auth/organization-limits";
import {
	USER_NAME_PART_MAX_LENGTH,
	userDisplayNamePartsTooLong,
	userNamePartMaxLengthMessage,
} from "@reloop/auth/user-name-limits";
import * as Checkbox from "@reloop/ui/checkbox";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import * as v from "valibot";
import { clearClientAuthState } from "#/features/auth/session-query";
import { toastApiError } from "#/lib/rate-limit-toast";
import { completeSetup, SetupRequestError } from "./setup-api";

export const SETUP_FORM_ID = "selfhost-setup-form";

export const PASSWORD_MIN_LENGTH = 8;
export const APP_NAME_MAX_LENGTH = 40;

export type SetupUiState = {
	canSubmit: boolean;
	isLoading: boolean;
	isSuccess: boolean;
};

const filled = (message: string) =>
	v.check((value: string) => value.trim().length > 0, message);

const setupSchema = v.object({
	adminKey: v.pipe(
		v.string("Setup key is required"),
		filled("Setup key is required"),
	),
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
});

type SetupFormData = v.InferInput<typeof setupSchema>;

function FieldLabel({
	htmlFor,
	children,
	optional = false,
}: {
	htmlFor: string;
	children: string;
	optional?: boolean;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="flex items-center justify-between gap-2 font-medium text-[13px] text-text-strong-950"
		>
			{children}
			{optional ? (
				<span className="font-normal text-[12px] text-text-soft-400">
					Optional
				</span>
			) : null}
		</label>
	);
}

export function SetupForm({
	onUiStateChange,
}: {
	onUiStateChange?: (state: SetupUiState) => void;
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
		formState: { errors, isValid },
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

	const isLoading = status === "loading";
	const canSubmit = isValid && !isLoading && !isSuccess;
	const isBusy = isLoading || isSuccess;

	const onUiStateChangeRef = useRef(onUiStateChange);
	onUiStateChangeRef.current = onUiStateChange;

	useEffect(() => {
		onUiStateChangeRef.current?.({ canSubmit, isLoading, isSuccess });
	}, [canSubmit, isLoading, isSuccess]);

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

	return (
		<form
			id={SETUP_FORM_ID}
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4"
		>
			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="adminKey">Setup key</FieldLabel>
				<Input.Root hasError={!!errors.adminKey} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-mono text-base"
							id="adminKey"
							type="text"
							autoComplete="off"
							spellCheck={false}
							placeholder="Printed by the installer"
							disabled={isBusy}
							{...register("adminKey")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.adminKey ? (
					<p className="text-error-base text-sm">{errors.adminKey.message}</p>
				) : (
					<p className="text-[12px] text-text-soft-400">
						Also saved to admin-setup.key in your install directory.
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="name">Your name</FieldLabel>
				<Input.Root hasError={!!errors.name} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
							id="name"
							type="text"
							autoComplete="name"
							maxLength={USER_NAME_PART_MAX_LENGTH * 2}
							placeholder="Steve Jobs"
							disabled={isBusy}
							{...register("name")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.name && (
					<p className="text-error-base text-sm">{errors.name.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="email">Email</FieldLabel>
				<Input.Root hasError={!!errors.email} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
							id="email"
							type="email"
							autoComplete="email"
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

			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="password">Password</FieldLabel>
				<Input.Root hasError={!!errors.password} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
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
							aria-label={showPassword ? "Hide password" : "Show password"}
							className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:text-text-strong-950 disabled:text-text-disabled-300"
						>
							<Icon
								name={showPassword ? "eye-slash-outline" : "eye-outline"}
								className="size-5"
							/>
						</button>
					</Input.Wrapper>
				</Input.Root>
				{errors.password && (
					<p className="text-error-base text-sm">{errors.password.message}</p>
				)}
			</div>

			<div
				className="border-stroke-soft-200 border-t border-dashed pt-1 dark:border-stroke-soft-100/40"
				aria-hidden
			/>

			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="organizationName" optional>
					Organization
				</FieldLabel>
				<Input.Root
					hasError={!!errors.organizationName}
					className="rounded-xl!"
				>
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
							id="organizationName"
							type="text"
							maxLength={ORGANIZATION_NAME_MAX_LENGTH}
							placeholder="Apple"
							disabled={isBusy}
							{...register("organizationName")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.organizationName ? (
					<p className="text-error-base text-sm">
						{errors.organizationName.message}
					</p>
				) : (
					<p className="text-[12px] text-text-soft-400">
						Leave empty to create your first organization later.
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<FieldLabel htmlFor="appName" optional>
					Instance name
				</FieldLabel>
				<Input.Root hasError={!!errors.appName} className="rounded-xl!">
					<Input.Wrapper>
						<Input.Input
							className="h-11 font-medium text-base"
							id="appName"
							type="text"
							maxLength={APP_NAME_MAX_LENGTH}
							placeholder="Reloop"
							disabled={isBusy}
							{...register("appName")}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.appName ? (
					<p className="text-error-base text-sm">{errors.appName.message}</p>
				) : (
					<p className="text-[12px] text-text-soft-400">
						Shown in emails and page titles. Defaults to Reloop.
					</p>
				)}
			</div>

			<label
				htmlFor="disableSignup"
				className="flex cursor-pointer select-none items-start gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-3 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
			>
				<Controller
					name="disableSignup"
					control={control}
					render={({ field }) => (
						<Checkbox.Root
							id="disableSignup"
							variant="black"
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={isBusy}
							className="mt-0.5"
						/>
					)}
				/>
				<span className="flex flex-col gap-0.5">
					<span className="font-medium text-[13px] text-text-strong-950">
						Turn off public sign-ups
					</span>
					<span className="text-[12px] text-text-sub-600 leading-relaxed">
						Only you can invite new people. Recommended for private instances.
					</span>
				</span>
			</label>
		</form>
	);
}
