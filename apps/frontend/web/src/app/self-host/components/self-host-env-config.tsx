"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const ENV_SNIPPET = `# --- Core Configuration ---
NODE_ENV=production
PUBLIC_URL=https://email.yourdomain.com
RELOOP_SECRET_KEY=generate_with_openssl_rand_hex_32

# --- Database & Cache ---
DATABASE_URL=postgresql://reloop:secret@localhost:5432/reloop?sslmode=disable
REDIS_URL=redis://localhost:6379

# --- SMTP Inbound & Outbound ---
SMTP_PORT=25
SMTP_SUBMISSION_PORT=587
SMTP_HOST=mail.yourdomain.com
SMTP_TLS_CERT_PATH=/etc/ssl/certs/mail.crt
SMTP_TLS_KEY_PATH=/etc/ssl/private/mail.key

# --- Storage (Attachments & Templates) ---
STORAGE_DRIVER=s3 # or local / minio
STORAGE_S3_BUCKET=reloop-email-storage
STORAGE_S3_REGION=us-east-1
STORAGE_S3_ACCESS_KEY=your_key
STORAGE_S3_SECRET_KEY=your_secret`;

export function SelfHostEnvConfig() {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(ENV_SNIPPET);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<section className="border-stroke-soft-200 border-t py-16 sm:py-20 dark:border-white/10">
			<div className="mx-auto max-w-5xl px-6 sm:px-8 md:max-w-7xl lg:px-12">
				<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-center">
					<div className="lg:col-span-5">
						<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
							Simple & Predictable Configuration
						</h2>
						<p className="mt-4 text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Everything is configured via standard environment variables. Pass them in Docker Compose, Kubernetes ConfigMaps, or systemd unit files.
						</p>

						<div className="mt-6 space-y-4">
							<div className="flex items-start gap-3">
								<div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
									<Icon name="check" className="size-3.5" />
								</div>
								<div>
									<h4 className="font-medium text-sm text-text-strong-950 dark:text-white">Zero External Lock-In</h4>
									<p className="text-[13px] text-text-sub-600 dark:text-white/55">Runs on standard Postgres, Redis, and local/S3 storage.</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
									<Icon name="check" className="size-3.5" />
								</div>
								<div>
									<h4 className="font-medium text-sm text-text-strong-950 dark:text-white">Automatic Schema Migrations</h4>
									<p className="text-[13px] text-text-sub-600 dark:text-white/55">Database tables and indexes are updated automatically on boot.</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
									<Icon name="check" className="size-3.5" />
								</div>
								<div>
									<h4 className="font-medium text-sm text-text-strong-950 dark:text-white">Air-Gapped Ready</h4>
									<p className="text-[13px] text-text-sub-600 dark:text-white/55">Operate inside private VPCs with zero outbound telemetry calls.</p>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-7">
						<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-[#0d0e11] shadow-xl dark:border-white/10">
							<div className="flex items-center justify-between border-white/10 border-b px-4 py-2.5">
								<span className="font-mono text-[12px] text-zinc-400">.env.production</span>
								<button
									type="button"
									onClick={handleCopy}
									className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[12px] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
								>
									{copied ? (
										<>
											<Icon name="check" className="size-3.5 text-emerald-400" />
											<span>Copied</span>
										</>
									) : (
										<>
											<Icon name="copy" className="size-3.5" />
											<span>Copy .env</span>
										</>
									)}
								</button>
							</div>
							<pre className="overflow-x-auto p-4 font-mono text-[12.5px] text-zinc-300 leading-relaxed sm:p-5">
								<code>{ENV_SNIPPET}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
