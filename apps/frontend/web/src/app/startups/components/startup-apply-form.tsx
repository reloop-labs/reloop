"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { type FormEvent, useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

function FieldLabel({
	htmlFor,
	children,
}: {
	htmlFor: string;
	children: React.ReactNode;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="block select-none font-medium text-[14px] text-text-strong-950 dark:text-white"
		>
			{children}
		</label>
	);
}

export function StartupApplyForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [company, setCompany] = useState("");
	const [useCase, setUseCase] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);

	const valid =
		firstName.trim().length > 0 &&
		lastName.trim().length > 0 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
		company.trim().length > 0 &&
		useCase.trim().length >= 10;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!valid || status === "sending") return;
		setStatus("sending");
		setError(null);
		try {
			const res = await fetch("/api/admin/startup-applications", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					fullName: `${firstName.trim()} ${lastName.trim()}`,
					company: company.trim(),
					useCase: useCase.trim(),
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
					Thanks — we review startup applications within 2 business days. Keep
					an eye on{" "}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{email}
					</span>{" "}
					for your $1,000 credit approval.
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
				Fill out the form and we&apos;ll be in touch within 2 business days.
			</p>
			<form onSubmit={handleSubmit} className="relative mt-7 space-y-5">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel htmlFor="su-first-name">First name</FieldLabel>
						<Input.Root size="small">
							<Input.Wrapper>
								<Input.Input
									id="su-first-name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="John"
									required
									autoComplete="given-name"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div className="space-y-2.5">
						<FieldLabel htmlFor="su-last-name">Last name</FieldLabel>
						<Input.Root size="small">
							<Input.Wrapper>
								<Input.Input
									id="su-last-name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Doe"
									required
									autoComplete="family-name"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
				<div className="space-y-2.5">
					<FieldLabel htmlFor="su-email">Professional Email</FieldLabel>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id="su-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@company.com"
								required
								autoComplete="email"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="space-y-2.5">
					<FieldLabel htmlFor="su-company">Company</FieldLabel>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id="su-company"
								type="text"
								value={company}
								onChange={(e) => setCompany(e.target.value)}
								placeholder="Company Name"
								required
								autoComplete="organization"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="space-y-2.5">
					<FieldLabel htmlFor="su-message">Message</FieldLabel>
					<Textarea.Root
						simple
						id="su-message"
						value={useCase}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setUseCase(e.target.value)
						}
						placeholder="Tell us about your product and how you'll use email…"
						rows={6}
						required
						className="min-h-32"
					/>
				</div>

				{status === "error" && error ? (
					<p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400">
						{error}
					</p>
				) : null}

				<div className="grid items-center gap-4 pt-2 sm:grid-cols-[1fr_auto]">
					<p className="text-[14px] text-text-sub-600 dark:text-white/55">
						By submitting this form, you agree to our{" "}
						<a href="/privacy" className="font-medium underline">
							Privacy Policy
						</a>
					</p>
					<Button.Root
						variant="primary"
						mode="filled"
						size="medium"
						type="submit"
						disabled={!valid || status === "sending"}
						className="max-sm:row-start-1"
					>
						{status === "sending" ? (
							<>
								<Spinner size={16} />
								<span>Submitting…</span>
							</>
						) : (
							<span>Apply for credits</span>
						)}
					</Button.Root>
				</div>
			</form>
		</div>
	);
}
