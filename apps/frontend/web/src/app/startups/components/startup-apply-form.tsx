"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Status = "idle" | "sending" | "done" | "error";

const MESSAGE_MIN_LENGTH = 20;
const MESSAGE_MAX_LENGTH = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StartupApplyValues = {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	useCase: string;
};

const labelClassName =
	"block gap-1 font-medium text-sm text-text-strong-950 dark:text-white";

export function StartupApplyForm() {
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);
	const [sentEmail, setSentEmail] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<StartupApplyValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			company: "",
			useCase: "",
		},
	});

	const useCaseValue = watch("useCase") ?? "";
	const useCaseError = errors.useCase?.message;

	async function onSubmit(data: StartupApplyValues) {
		if (status === "sending") return;
		setStatus("sending");
		setError(null);
		try {
			const res = await fetch("/api/admin/startup-applications", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: data.email.trim(),
					fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
					company: data.company.trim(),
					useCase: data.useCase.trim(),
				}),
			});
			if (!res.ok) {
				let message = `Request failed (${res.status})`;
				try {
					const data = (await res.json()) as {
						message?: string;
						why?: string;
					};
					message = data.message || data.why || message;
				} catch {
					const text = await res.text().catch(() => "");
					if (text) message = text.slice(0, 300);
				}
				throw new Error(message);
			}
			setSentEmail(data.email.trim());
			setStatus("done");
		} catch (err) {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Something went wrong");
		}
	}

	if (status === "done") {
		return (
			<div className="flex w-full flex-col gap-4 py-4">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
					<Icon name="check-circle" className="size-6 text-emerald-500" />
				</div>
				<h2 className="mt-5 font-medium text-[20px] text-text-strong-950 dark:text-white">
					Application received
				</h2>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
					Thanks — we review startup applications within 5 business days. Keep
					an eye on{" "}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{sentEmail}
					</span>{" "}
					for your credit approval of up to $1,000.
				</p>
				<p className="mt-6 font-mono text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/35">
					No signup needed · No card required
				</p>
			</div>
		);
	}

	return (
		<div className="w-full">
			<h2 className="font-medium text-[20px] text-text-strong-950 dark:text-white">
				Apply for credits
			</h2>
			<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/55">
				Fill out the form and we&apos;ll be in touch within 5 business days.
			</p>
			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				className="relative mt-7 space-y-5"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1">
						<Label.Root htmlFor="su-first-name" className={labelClassName}>
							First name
							<Label.Asterisk className="text-error-base" />
						</Label.Root>
						<div className="relative">
							<Input.Root
								size="small"
								className="w-full rounded-xl"
								hasError={!!errors.firstName}
							>
								<Input.Wrapper>
									<Input.Input
										id="su-first-name"
										placeholder="John"
										autoComplete="given-name"
										{...register("firstName", {
											required: "First name is required",
										})}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						{errors.firstName ? (
							<p className="text-error-base text-xs">
								{errors.firstName.message}
							</p>
						) : null}
					</div>
					<div className="space-y-1">
						<Label.Root htmlFor="su-last-name" className={labelClassName}>
							Last name
							<Label.Asterisk className="text-error-base" />
						</Label.Root>
						<div className="relative">
							<Input.Root
								size="small"
								className="w-full rounded-xl"
								hasError={!!errors.lastName}
							>
								<Input.Wrapper>
									<Input.Input
										id="su-last-name"
										placeholder="Doe"
										autoComplete="family-name"
										{...register("lastName", {
											required: "Last name is required",
										})}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						{errors.lastName ? (
							<p className="text-error-base text-xs">
								{errors.lastName.message}
							</p>
						) : null}
					</div>
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="su-email" className={labelClassName}>
						Professional Email
						<Label.Asterisk className="text-error-base" />
					</Label.Root>
					<div className="relative">
						<Input.Root
							size="small"
							className="w-full rounded-xl"
							hasError={!!errors.email}
						>
							<Input.Wrapper>
								<Input.Input
									id="su-email"
									type="email"
									placeholder="name@company.com"
									autoComplete="email"
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: EMAIL_PATTERN,
											message: "Enter a valid email address",
										},
									})}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					{errors.email ? (
						<p className="text-error-base text-xs">{errors.email.message}</p>
					) : null}
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="su-company" className={labelClassName}>
						Company
						<Label.Asterisk className="text-error-base" />
					</Label.Root>
					<div className="relative">
						<Input.Root
							size="small"
							className="w-full rounded-xl"
							hasError={!!errors.company}
						>
							<Input.Wrapper>
								<Input.Input
									id="su-company"
									type="text"
									placeholder="Company Name"
									autoComplete="organization"
									{...register("company", {
										required: "Company is required",
									})}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					{errors.company ? (
						<p className="text-error-base text-xs">{errors.company.message}</p>
					) : null}
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="su-message" className={labelClassName}>
						Message
						<Label.Asterisk className="text-error-base" />
					</Label.Root>
					<Textarea.Root
						id="su-message"
						placeholder="Tell us about your product and how you'll use email…"
						rows={6}
						maxLength={MESSAGE_MAX_LENGTH}
						hasError={!!errors.useCase}
						{...register("useCase", {
							required: "Message is required",
							maxLength: {
								value: MESSAGE_MAX_LENGTH,
								message: `Keep it under ${MESSAGE_MAX_LENGTH} characters`,
							},
							validate: (value) => {
								const remaining = MESSAGE_MIN_LENGTH - value.trim().length;
								return (
									remaining <= 0 ||
									`Write at least ${remaining} more characters (minimum ${MESSAGE_MIN_LENGTH})`
								);
							},
						})}
					>
						<Textarea.CharCounter
							current={useCaseValue.length}
							max={MESSAGE_MAX_LENGTH}
							className="text-[10px]"
						/>
					</Textarea.Root>
					{useCaseError ? (
						<p className="text-error-base text-xs">{useCaseError}</p>
					) : null}
				</div>

				{status === "error" && error ? (
					<p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400">
						{error}
					</p>
				) : null}

				<div className="grid items-center gap-4 pt-2 sm:grid-cols-[1fr_auto]">
					<p className="text-[14px] text-text-sub-600 dark:text-white/55">
						By submitting, you agree to our{" "}
						<a href="/terms-and-conditions" className="font-medium underline">
							T&C
						</a>
					</p>
					<FancyButton.Root
						variant="neutral"
						size="medium"
						type="submit"
						className="max-sm:row-start-1 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
					>
						{status === "sending" ? (
							<>
								<Spinner size={16} />
								<span>Submitting…</span>
							</>
						) : (
							<span>Apply for credits</span>
						)}
					</FancyButton.Root>
				</div>
			</form>
		</div>
	);
}
