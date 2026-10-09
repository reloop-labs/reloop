"use client";

import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Status = "idle" | "sending" | "done" | "error";

const MESSAGE_MIN_LENGTH = 20;
const MESSAGE_MAX_LENGTH = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	useCase: string;
};

const labelClassName =
	"block gap-1 font-medium text-sm text-text-strong-950 dark:text-white";

function FieldErrorMessage({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="text-error-base text-xs">{message}</p>;
}

export function ContactForm() {
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);
	const [sentEmail, setSentEmail] = useState("");
	const [mounted, setMounted] = useState(false);
	const { useSession } = authClient;
	const { data: session, isPending } = useSession();

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ContactFormValues>({
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

	async function onSubmit(data: ContactFormValues) {
		if (status === "sending") return;
		setStatus("sending");
		setError(null);
		try {
			const res = await fetch("/api/admin/startup-applications", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "contact",
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
					Message received
				</h2>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
					Thanks — we&apos;ll get back to you within 2 business days. Keep an
					eye on{" "}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{sentEmail}
					</span>{" "}
					for our reply.
				</p>
			</div>
		);
	}

	return (
		<div className="w-full">
			<h2 className="font-medium text-[20px] text-text-strong-950 dark:text-white">
				Contact us
			</h2>
			<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/55">
				Fill out the form and we&apos;ll get back to you within 2 business days.
			</p>
			{mounted && !isPending && session ? (
				<div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-stroke-soft-200 px-4 py-3 dark:border-white/10">
					<div className="min-w-0">
						<p className="truncate font-medium text-[14px] text-text-strong-950 dark:text-white">
							You are logged in as: {session.user.email ?? ""}
						</p>
						<p className="mt-0.5 text-text-sub-600 text-xs dark:text-white/55">
							Chat with the founders to get help live reply in ~2 mins.
						</p>
					</div>
					<FancyButton.Root
						asChild
						variant="basic"
						size="small"
						className="shrink-0"
					>
						<a href="/dashboard/help">Chat now</a>
					</FancyButton.Root>
				</div>
			) : null}
			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				className="relative mt-7 space-y-5"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1">
						<Label.Root htmlFor="ct-first-name" className={labelClassName}>
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
										id="ct-first-name"
										placeholder="John"
										autoComplete="given-name"
										{...register("firstName", {
											required: "First name is required",
										})}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<FieldErrorMessage message={errors.firstName?.message} />
					</div>
					<div className="space-y-1">
						<Label.Root htmlFor="ct-last-name" className={labelClassName}>
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
										id="ct-last-name"
										placeholder="Doe"
										autoComplete="family-name"
										{...register("lastName", {
											required: "Last name is required",
										})}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<FieldErrorMessage message={errors.lastName?.message} />
					</div>
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="ct-email" className={labelClassName}>
						Email
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
									id="ct-email"
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
					<FieldErrorMessage message={errors.email?.message} />
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="ct-company" className={labelClassName}>
						Company
					</Label.Root>
					<div className="relative">
						<Input.Root size="small" className="w-full rounded-xl">
							<Input.Wrapper>
								<Input.Input
									id="ct-company"
									type="text"
									placeholder="Company Name"
									autoComplete="organization"
									{...register("company")}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
				<div className="space-y-1">
					<Label.Root htmlFor="ct-message" className={labelClassName}>
						Message
						<Label.Asterisk className="text-error-base" />
					</Label.Root>
					<Textarea.Root
						id="ct-message"
						placeholder="Tell us what's going on and how we can help…"
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

				<div className="pt-2">
					<FancyButton.Root
						variant="neutral"
						size="medium"
						type="submit"
						className="w-full dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
					>
						{status === "sending" ? (
							<>
								<Spinner size={16} />
								<span>Sending…</span>
							</>
						) : (
							<span>Send message</span>
						)}
					</FancyButton.Root>
				</div>
			</form>
		</div>
	);
}
