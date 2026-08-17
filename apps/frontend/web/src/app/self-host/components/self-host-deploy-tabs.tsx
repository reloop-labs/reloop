"use client";

import { Icon } from "@reloop/ui/icon";
import { cn } from "@reloop/ui/cn";
import { useState } from "react";

type DeployMethod = "docker-compose" | "cli" | "coolify" | "kubernetes";

const DOCKER_COMPOSE_YML = `services:
  app:
    image: ghcr.io/reloop-labs/reloop:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "25:25"      # SMTP Inbound
      - "587:587"    # SMTP Submission
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://reloop:secret@postgres:5432/reloop
      - REDIS_URL=redis://redis:6379
      - RELOOP_SECRET_KEY=change_me_to_a_random_32_byte_hex
      - PUBLIC_URL=https://email.yourdomain.com
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: reloop
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: reloop
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:`;

const CLI_SCRIPT = `# 1. Download and run the interactive setup wizard
npx getopen init

# Or bootstrap directly with environment checks
curl -fsSL https://reloop.sh/install.sh | bash

# 2. Start all services in the background
reloop up -d

# 3. Access your admin dashboard at http://localhost:3000`;

const COOLIFY_GUIDE = `# Deploy on Coolify in 3 clicks:
1. Open your Coolify dashboard -> New Service.
2. Select "Reloop Email Infrastructure" from Community Templates (or Docker Compose).
3. Set your custom domain: https://email.yourdomain.com
4. Click "Deploy". Coolify handles SSL certificates and reverse proxy automatically.`;

const KUBERNETES_HELM = `# Add Reloop Helm repository
helm repo add reloop https://charts.reloop.sh
helm repo update

# Install with production values
helm install reloop reloop/reloop \\
  --namespace reloop \\
  --create-namespace \\
  --set ingress.enabled=true \\
  --set ingress.hosts[0].host=email.yourdomain.com \\
  --set postgresql.enabled=true \\
  --set redis.enabled=true`;

export function SelfHostDeployTabs() {
	const [activeTab, setActiveTab] = useState<DeployMethod>("docker-compose");
	const [copied, setCopied] = useState(false);

	const getSnippet = () => {
		switch (activeTab) {
			case "docker-compose":
				return DOCKER_COMPOSE_YML;
			case "cli":
				return CLI_SCRIPT;
			case "coolify":
				return COOLIFY_GUIDE;
			case "kubernetes":
				return KUBERNETES_HELM;
		}
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(getSnippet());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<section id="quickstart" className="py-16 sm:py-20">
			<div className="mx-auto max-w-5xl px-6 sm:px-8 md:max-w-7xl lg:px-12">
				<div className="text-center">
					<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
						Choose Your Deployment Method
					</h2>
					<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
						Deploy locally in seconds or run in production with high availability.
					</p>
				</div>

				{/* Tabs header */}
				<div className="mt-10 flex items-center justify-center">
					<div className="inline-flex rounded-xl border border-stroke-soft-200 bg-bg-weak-50/80 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
						{[
							{ id: "docker-compose" as const, label: "Docker Compose", icon: "server" as const },
							{ id: "cli" as const, label: "CLI / Script", icon: "activity" as const },
							{ id: "coolify" as const, label: "Coolify (1-Click)", icon: "layout" as const },
							{ id: "kubernetes" as const, label: "Kubernetes", icon: "globe" as const },
						].map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-2 rounded-lg px-3.5 py-2 font-medium text-[13px] transition-all sm:px-4 sm:text-sm",
									activeTab === tab.id
										? "bg-white text-text-strong-950 shadow-sm dark:bg-[#1f2023] dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
								)}
							>
								<Icon name={tab.icon} className="size-4" />
								<span>{tab.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Code container */}
				<div className="relative mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-[#0d0e11] shadow-2xl dark:border-white/10">
					<div className="flex items-center justify-between border-white/10 border-b px-4 py-3 sm:px-5">
						<div className="flex items-center gap-2">
							<div className="size-3 rounded-full bg-[#ff5f56]/80" />
							<div className="size-3 rounded-full bg-[#ffbd2e]/80" />
							<div className="size-3 rounded-full bg-[#27c93f]/80" />
							<span className="ml-2 font-mono text-[12px] text-zinc-400">
								{activeTab === "docker-compose" && "docker-compose.yml"}
								{activeTab === "cli" && "terminal"}
								{activeTab === "coolify" && "coolify-setup.md"}
								{activeTab === "kubernetes" && "helm-values.sh"}
							</span>
						</div>
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
									<span>Copy snippet</span>
								</>
							)}
						</button>
					</div>

					<pre className="overflow-x-auto p-4 font-mono text-[13px] text-zinc-300 leading-relaxed sm:p-6">
						<code>{getSnippet()}</code>
					</pre>
				</div>
			</div>
		</section>
	);
}
