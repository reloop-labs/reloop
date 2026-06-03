"use client";

import Link from "next/link";

const credentials = [
	{ key: "Host", value: "smtp.reloop.sh" },
	{ key: "Port", value: "587 (STARTTLS) or 465 (SSL)" },
	{ key: "Username", value: "From your Reloop dashboard" },
	{ key: "Password", value: "SMTP password from dashboard" },
];

export default function Connection() {
	return (
		<section id="connection">
			<div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
					<div className="lg:w-[420px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Connection details
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
							Copy these into{" "}
							<span className="text-primary-base">your mailer.</span>
						</h2>
						<p className="mt-5 text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
							Create SMTP credentials in the dashboard, then paste the values
							into your app&apos;s email settings—same as any other SMTP provider.
						</p>
						<Link
							href="/dashboard/signup"
							className="mt-6 inline-block font-semibold text-primary-base text-sm underline decoration-primary-base/30 underline-offset-4"
						>
							Create credentials →
						</Link>
					</div>

					<div className="flex-1 space-y-6">
						<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
							{credentials.map((row, index) => (
								<div
									key={row.key}
									className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${index > 0 ? "border-stroke-soft-200 border-t dark:border-white/10" : ""}`}
								>
									<span className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
										{row.key}
									</span>
									<span className="font-mono text-[14px] text-text-strong-950 dark:text-white">
										{row.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
