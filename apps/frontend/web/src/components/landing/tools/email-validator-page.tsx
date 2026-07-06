"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	ChecklistTable,
	ToolPanel,
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import {
	type EmailValidationResult,
	validateEmailAddress,
} from "@reloop/web/lib/landing/tools/validation-utils";
import Link from "next/link";
import { type FormEvent, useState } from "react";

export function EmailValidatorPageView() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<EmailValidationResult | null>(null);

	async function handleValidate(e?: FormEvent) {
		e?.preventDefault();
		setLoading(true);
		const next = await validateEmailAddress(email);
		setResult(next);
		setLoading(false);
	}

	return (
		<div className="min-h-screen bg-[#f4f4f5] dark:bg-black">
			<ToolTopBar
				accent="emerald"
				breadcrumb={[
					{ label: "Tools", href: "/tools" },
					{ label: "Email Validator", href: "/tools/email-validator" },
				]}
				title="Free Email Validator"
				subtitle="Check syntax, typos, disposable domains, and MX records—the same checks marketers expect from standard email verification tools."
			/>

			<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
				<ToolPanel>
					<form onSubmit={handleValidate} className="space-y-4">
						<label
							htmlFor="email-input"
							className="block font-medium text-[14px] text-text-strong-950 dark:text-white"
						>
							Email address
						</label>
						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1">
								<Icon
									name="mail"
									className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 size-5 text-text-sub-600 dark:text-white/30"
								/>
								<input
									id="email-input"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="name@company.com"
									className="h-12 w-full rounded-xl border border-stroke-soft-200 bg-white pr-4 pl-12 text-[15px] outline-none ring-primary-base/30 focus:ring-2 dark:border-white/10 dark:bg-black"
									autoComplete="off"
									spellCheck={false}
								/>
							</div>
							<button
								type="submit"
								disabled={loading || !email.trim()}
								className={`${Button.buttonVariants({ variant: "neutral" }).root()} h-12 min-w-[140px] rounded-full bg-emerald-600! text-white! hover:bg-emerald-700! disabled:opacity-50`}
							>
								{loading ? "Checking…" : "Verify email"}
							</button>
						</div>
						<p className="text-[12px] text-text-sub-600 dark:text-white/35">
							Press Enter or click Verify. MX lookup uses public DNS—no address
							is stored.
						</p>
					</form>

					{result && (
						<div className="mt-8 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
							<div
								className={`mb-6 flex items-start gap-4 rounded-xl p-4 ${
									result.valid
										? "bg-emerald-50 dark:bg-emerald-950/30"
										: "bg-red-50 dark:bg-red-950/20"
								}`}
							>
								<div
									className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
										result.valid
											? "bg-emerald-500 text-white"
											: "bg-red-500 text-white"
									}`}
								>
									<Icon
										name={result.valid ? "check" : "cross-circle"}
										className="size-5"
									/>
								</div>
								<div>
									<p className="font-semibold text-lg text-text-strong-950 dark:text-white">
										{result.valid ? "Valid email" : "Invalid or risky email"}
									</p>
									<p className="mt-1 text-[14px] text-text-sub-600 dark:text-white/50">
										{result.summary}
									</p>
									<p className="mt-2 font-mono text-[13px] text-text-sub-600 dark:text-white/40">
										{result.email}
									</p>
								</div>
							</div>

							<ChecklistTable checks={result.checks} />
						</div>
					)}
				</ToolPanel>

				<div className="mt-8 grid gap-4 sm:grid-cols-3">
					{[
						{
							title: "Signup forms",
							text: "Block typos and disposable addresses before they enter your list.",
						},
						{
							title: "List imports",
							text: "Scan CSV uploads and flag addresses that will bounce.",
						},
						{
							title: "API validation",
							text: "Automate checks in your app with Reloop's validation API.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="rounded-xl border border-stroke-soft-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]"
						>
							<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
								{item.title}
							</p>
							<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/45">
								{item.text}
							</p>
						</div>
					))}
				</div>

				<p className="mt-8 text-center text-[13px] text-text-sub-600 dark:text-white/35">
					Also try{" "}
					<Link
						href="/tools/auth-checker"
						className="text-primary-base hover:underline"
					>
						SPF/DKIM/DMARC checker
					</Link>{" "}
					or browse the{" "}
					<Link href="/grosory" className="text-primary-base hover:underline">
						full site directory
					</Link>
					.
				</p>
			</div>

			<ToolUpsell
				title="Validate thousands of addresses via API"
				description="Plug Reloop validation into signup forms, CRM imports, and checkout flows."
				primaryHref="/dashboard/signup"
				primaryLabel="Start free"
				secondaryHref="/features/email-validation"
				secondaryLabel="Validation API"
			/>
		</div>
	);
}
