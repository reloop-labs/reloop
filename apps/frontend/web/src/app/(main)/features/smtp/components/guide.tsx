"use client";

const steps = [
	{
		number: "1",
		title: "Create SMTP credentials",
		description:
			"Sign up and open the dashboard. Generate an SMTP username and password for your project.",
	},
	{
		number: "2",
		title: "Add host & port to your app",
		description: `Set host to smtp.reloop.sh, port 587, enable TLS. Paste your username and password.`,
	},
	{
		number: "3",
		title: "Send a test email",
		description:
			"Trigger a password reset, welcome email, or script—check the dashboard for delivery status.",
	},
];

export default function Guide() {
	return (
		<section id="guide">
			<div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Quick start
					</p>
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
						Three steps to{" "}
						<span className="text-primary-base">send email.</span>
					</h2>
				</div>

				<div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-3">
					{steps.map((step) => (
						<div
							key={step.number}
							className="rounded-2xl border border-stroke-soft-200 p-5 dark:border-white/10"
						>
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								{step.number}
							</span>
							<h3 className="mt-4 font-semibold text-[16px] text-text-strong-950 leading-snug dark:text-white">
								{step.title}
							</h3>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
