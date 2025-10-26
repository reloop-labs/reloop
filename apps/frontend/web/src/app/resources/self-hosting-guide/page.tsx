import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Self-Hosting Guide | Reloop",
	description:
		"Deploy Reloop on your own infrastructure with our comprehensive self-hosting guide. Docker, Kubernetes, and bare metal installation instructions.",
	openGraph: {
		title: "Self-Hosting Guide | Reloop",
		description:
			"Deploy Reloop on your own infrastructure with our comprehensive self-hosting guide. Docker, Kubernetes, and bare metal installation instructions.",
		type: "website",
	},
};

const SelfHostingGuidePage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Self-Hosting Guide
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Deploy Reloop on your own infrastructure with our comprehensive
					self-hosting guide. Docker, Kubernetes, and bare metal installation
					instructions.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started
					</Link>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						View on GitHub
					</a>
				</div>
			</section>

			{/* Prerequisites */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Prerequisites</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Before you begin, ensure your system meets the minimum
							requirements for self-hosting Reloop.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
								<svg
									className="h-6 w-6 text-blue-600 dark:text-blue-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								System Requirements
							</h3>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• 4+ CPU cores</li>
								<li>• 8GB+ RAM</li>
								<li>• 50GB+ storage</li>
								<li>• Ubuntu 20.04+ or CentOS 8+</li>
								<li>• Docker 20.10+</li>
								<li>• Docker Compose 2.0+</li>
							</ul>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
								<svg
									className="h-6 w-6 text-green-600 dark:text-green-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Dependencies</h3>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• PostgreSQL 13+</li>
								<li>• Redis 6+</li>
								<li>• SMTP server (Postfix)</li>
								<li>• Web server (Nginx/Caddy)</li>
								<li>• SSL certificate</li>
								<li>• Domain name</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Installation Methods */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Installation Methods
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Choose the installation method that best fits your infrastructure
							and deployment preferences.
						</p>
					</div>

					<div className="space-y-8">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">🐳</div>
								<h3 className="font-semibold text-2xl">Docker Compose</h3>
								<div className="rounded bg-green-100 px-2 py-1 font-semibold text-green-800 text-xs dark:bg-green-900/30 dark:text-green-400">
									Recommended
								</div>
							</div>
							<p className="mb-6 text-text-sub-600 leading-6">
								The easiest way to get started with Reloop. All services are
								pre-configured and ready to run with a single command.
							</p>
							<div className="rounded bg-gray-50 p-6 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									# Clone the repository
								</div>
								<div className="mt-2">
									git clone https://github.com/reloop-labs/reloop.git
								</div>
								<div className="mt-2">cd reloop</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Copy environment file
								</div>
								<div className="mt-2">cp .env.example .env</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Start all services
								</div>
								<div className="mt-2">docker-compose up -d</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">☸️</div>
								<h3 className="font-semibold text-2xl">Kubernetes</h3>
								<div className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-800 text-xs dark:bg-blue-900/30 dark:text-blue-400">
									Production
								</div>
							</div>
							<p className="mb-6 text-text-sub-600 leading-6">
								Deploy Reloop on Kubernetes for high availability and
								scalability. Includes Helm charts and production-ready
								configurations.
							</p>
							<div className="rounded bg-gray-50 p-6 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									# Add Helm repository
								</div>
								<div className="mt-2">
									helm repo add reloop https://charts.reloop.com
								</div>
								<div className="mt-2">helm repo update</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Install Reloop
								</div>
								<div className="mt-2">helm install reloop reloop/reloop</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">🖥️</div>
								<h3 className="font-semibold text-2xl">Bare Metal</h3>
								<div className="rounded bg-orange-100 px-2 py-1 font-semibold text-orange-800 text-xs dark:bg-orange-900/30 dark:text-orange-400">
									Advanced
								</div>
							</div>
							<p className="mb-6 text-text-sub-600 leading-6">
								Install Reloop directly on your server without containers.
								Provides maximum control and customization options.
							</p>
							<div className="rounded bg-gray-50 p-6 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									# Install dependencies
								</div>
								<div className="mt-2">
									sudo apt update && sudo apt install postgresql redis-server
									nginx
								</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Clone and build
								</div>
								<div className="mt-2">
									git clone https://github.com/reloop-labs/reloop.git
								</div>
								<div className="mt-2">cd reloop && make build</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Configuration */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Configuration</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Configure Reloop for your environment with these essential
							settings and environment variables.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-4 font-semibold text-xl">
								Environment Variables
							</h3>
							<div className="space-y-4">
								<div>
									<h4 className="mb-2 font-semibold text-blue-600 text-sm dark:text-blue-400">
										Database
									</h4>
									<div className="rounded bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
										<div>
											DATABASE_URL=postgresql://user:pass@localhost/reloop
										</div>
										<div>REDIS_URL=redis://localhost:6379</div>
									</div>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-green-600 text-sm dark:text-green-400">
										SMTP
									</h4>
									<div className="rounded bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
										<div>SMTP_HOST=smtp.yourdomain.com</div>
										<div>SMTP_PORT=587</div>
										<div>SMTP_USER=your-email@domain.com</div>
									</div>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-purple-600 text-sm dark:text-purple-400">
										Security
									</h4>
									<div className="rounded bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
										<div>JWT_SECRET=your-secret-key</div>
										<div>ENCRYPTION_KEY=your-encryption-key</div>
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-4 font-semibold text-xl">SSL Configuration</h3>
							<div className="space-y-4">
								<div>
									<h4 className="mb-2 font-semibold text-orange-600 text-sm dark:text-orange-400">
										Let's Encrypt
									</h4>
									<div className="rounded bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
										<div># Using Certbot</div>
										<div>sudo certbot --nginx -d yourdomain.com</div>
									</div>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-indigo-600 text-sm dark:text-indigo-400">
										Custom Certificate
									</h4>
									<div className="rounded bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
										<div># Place certificates in /etc/ssl/</div>
										<div>SSL_CERT_PATH=/etc/ssl/cert.pem</div>
										<div>SSL_KEY_PATH=/etc/ssl/key.pem</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Maintenance */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Maintenance & Updates
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Keep your Reloop instance up to date and running smoothly with
							these maintenance procedures.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
								<svg
									className="h-6 w-6 text-blue-600 dark:text-blue-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Updates</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Keep your Reloop instance updated with the latest features and
								security patches.
							</p>
							<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									# Docker Compose
								</div>
								<div className="mt-2">git pull origin main</div>
								<div className="mt-2">docker-compose pull</div>
								<div className="mt-2">docker-compose up -d</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
								<svg
									className="h-6 w-6 text-green-600 dark:text-green-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Backups</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Regular backups ensure your data is safe and can be restored
								quickly if needed.
							</p>
							<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									# Database backup
								</div>
								<div className="mt-2">pg_dump reloop &gt; backup.sql</div>
								<div className="mt-2 text-gray-600 dark:text-gray-400">
									# Redis backup
								</div>
								<div className="mt-2">redis-cli BGSAVE</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Self-Host?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Get started with self-hosting Reloop today. Follow our step-by-step
					guide and have your own email infrastructure running in minutes.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						View on GitHub
					</a>
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Read Documentation
					</Link>
				</div>
			</section>
		</div>
	);
};

export default SelfHostingGuidePage;
