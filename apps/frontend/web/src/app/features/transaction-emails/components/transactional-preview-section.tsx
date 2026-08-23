"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmailStack } from "../../../(home)/components/transactional-email/email-stack";
import { LanguageIcon } from "../../../sdk/components/language-icon";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";
import { frameworks } from "../../../sdk/frameworks";

const EMAIL_CYCLE = ["otp", "reset", "welcome", "invite"] as const;

const SEND_CODE_TS = `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

await reloop.emails.send({
  from: 'Acme <onboarding@yourdomain.com>',
  to: ['maya@northwind.io'],
  subject: 'Welcome to Acme',
  html: '<strong>Your workspace is ready.</strong>',
});`;

export function TransactionalPreviewSection() {
	const [emailIndex, setEmailIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setEmailIndex((prev) => (prev + 1) % EMAIL_CYCLE.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const activeEmailId = EMAIL_CYCLE[emailIndex];

	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
					{/* Left Panel: Frameworks */}
					<div className="flex flex-col p-8 sm:p-10 lg:p-12">
						<div>
							<div className="mb-4">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
									<Icon name="code" className="size-3.5" />
									Developer First
								</span>
							</div>
							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Send email from your favorite framework.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Official SDKs and native libraries for Node.js, Python, Go, PHP,
								Ruby, Java, .NET, and Elixir.
							</p>
						</div>

						<div className="mt-7 flex max-w-lg flex-wrap items-center gap-4 sm:gap-4.5">
							{frameworks.map((fw) => (
								<Link
									key={fw.slug}
									href={`/frameworks/${fw.slug}`}
									title={`Send email with ${fw.name}`}
									aria-label={`Send email with ${fw.name}`}
									className="group flex cursor-pointer items-center justify-center p-1 text-text-strong-950 transition-transform duration-150 hover:scale-115 dark:text-white"
								>
									<span className="flex items-center justify-center">
										<LanguageIcon icon={fw.icon} className="size-7 sm:size-8" />
									</span>
								</Link>
							))}
						</div>

						<div className="mt-7 w-full">
							<SdkCodeBlock slug="nodejs" code={SEND_CODE_TS} path="send.ts" />
						</div>
					</div>

					{/* Right Panel: Email Preview */}
					<div className="relative flex flex-col p-8 sm:p-10 lg:p-12">
						{/* Top Right Progress Indicator */}
						<div className="absolute top-8 right-8 z-20 flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0/90 px-2.5 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
							{/* Circular progress ring */}
							<div className="relative flex size-3 items-center justify-center">
								<svg className="-rotate-90 size-3" viewBox="0 0 24 24">
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="3.5"
										className="text-stroke-soft-200 dark:text-white/15"
										fill="none"
									/>
									<motion.circle
										key={emailIndex}
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="3.5"
										strokeLinecap="round"
										className="text-orange-500 dark:text-orange-400"
										fill="none"
										strokeDasharray="62.83"
										initial={{ strokeDashoffset: 62.83 }}
										animate={{ strokeDashoffset: 0 }}
										transition={{ duration: 3, ease: "linear" }}
									/>
								</svg>
							</div>

							<span className="font-medium font-mono text-[11px] text-text-sub-600 dark:text-white/70">
								{emailIndex + 1}/{EMAIL_CYCLE.length}
							</span>
						</div>

						<div>
							<div className="mb-4">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
									<Icon name="layout" className="size-3.5" />
									Templates
								</span>
							</div>
							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Readymade templates to send.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Drop-in responsive templates for OTP verification, password
								resets, welcome sequences, and workspace invites.
							</p>
						</div>

						<div className="relative mx-auto mt-12 max-h-[380px] w-full max-w-sm overflow-hidden rounded-[20px] sm:mt-14 sm:max-h-[400px]">
							<div className="relative overflow-hidden rounded-[22px] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_98%)] [mask-image:linear-gradient(to_bottom,black_60%,transparent_98%)]">
								<EmailStack activeId={activeEmailId} />
							</div>
							{/* Gradient fade to section background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-bg-white-0 via-bg-white-0/60 to-transparent dark:from-black dark:via-black/60"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
