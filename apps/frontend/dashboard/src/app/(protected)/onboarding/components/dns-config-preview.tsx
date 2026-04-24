"use client";

import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

interface ProviderConfig {
	name: string;
	color: string;
	borderColor: string;
	textColor: string;
	icon: React.ReactNode;
	url: string | null;
	supportsAutoConnect?: boolean;
}

type ProviderKey = "cloudflare" | "vercel" | "godaddy" | "unknown";

const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
	cloudflare: {
		name: "Cloudflare",
		color: "from-orange-100 to-orange-50",
		borderColor: "border-orange-200",
		textColor: "text-orange-600",
		icon: (
			<svg
				className="h-5 w-5 text-orange-600"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M17.5 19c.7-.3 1.2-.7 1.7-1.3l.1-.9.1-1.3-.1-1.3-.1-.9c-.5-.6-1-1-1.7-1.3" />
				<path d="M12.5 19c.6-.3 1.1-.7 1.6-1.3l.1-.9.1-1.3-.1-1.3-.1-.9c-.5-.6-1-1-1.6-1.3" />
				<path d="M7.5 19c.6-.3 1.1-.7 1.6-1.3l.1-.9.1-1.3-.1-1.3-.1-.9c-.5-.6-1-1-1.6-1.3" />
				<path d="M2.5 19c.6-.3 1-.7 1.5-1.3l.1-.9.1-1.3-.1-1.3-.1-.9c-.5-.6-1-1-1.5-1.3" />
				<path d="M22 13h-4l-2 4h4l2-4Z" />
				<path d="M18 13.5 16.5 16" />
				<path d="M14 13.5 12.5 16" />
				<path d="M10 13.5 8.5 16" />
				<path d="M6 13.5 4.5 16" />
			</svg>
		),
		url: "https://dash.cloudflare.com",
		supportsAutoConnect: true,
	},
	vercel: {
		name: "Vercel",
		color: "from-zinc-100 to-zinc-50",
		borderColor: "border-stroke-soft-200",
		textColor: "text-text-strong-950",
		icon: (
			<svg
				className="h-5 w-5 fill-current text-text-strong-950"
				viewBox="0 0 24 24"
			>
				<path d="M12 1L24 22H0L12 1Z" />
			</svg>
		),
		url: "https://vercel.com/dashboard",
		supportsAutoConnect: true,
	},
	godaddy: {
		name: "GoDaddy",
		color: "from-teal-100 to-teal-50",
		borderColor: "border-teal-200",
		textColor: "text-teal-600",
		icon: <Icon name="server" className="h-5 w-5 text-teal-600" />,
		url: "https://dcc.godaddy.com/manage",
	},
	unknown: {
		name: "DNS Provider",
		color: "from-blue-50 to-indigo-50",
		borderColor: "border-stroke-soft-200",
		textColor: "text-primary-base",
		icon: <Icon name="globe" className="h-5 w-5 text-primary-base" />,
		url: null,
	},
};

interface DnsConfigPreviewProps {
	domain?: string;
}

export const DnsConfigPreview = ({ domain }: DnsConfigPreviewProps) => {
	const [detectedProvider, setDetectedProvider] =
		useState<ProviderKey>("cloudflare");
	const [isDetecting, setIsDetecting] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const handleAutoConnect = async () => {
		setIsConnecting(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsConnecting(false);
		setIsConnected(true);
	};

	useEffect(() => {
		if (!domain) {
			setDetectedProvider("unknown");
			return;
		}

		setIsDetecting(true);
		const timer = setTimeout(() => {
			if (domain.includes("vercel")) setDetectedProvider("vercel");
			else if (domain.includes("cloud")) setDetectedProvider("cloudflare");
			else if (domain.includes("go")) setDetectedProvider("godaddy");
			else setDetectedProvider("unknown");
			setIsDetecting(false);
		}, 600);

		return () => clearTimeout(timer);
	}, [domain]);

	const provider = PROVIDERS[detectedProvider];

	return (
		<div className="flex h-full w-full flex-col items-center justify-center p-6">
			<div className="flex w-full max-w-[440px] flex-col gap-4">
				{/* Provider Status Card */}
				<div className="rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/40">
					<div className="p-5">
						<div className="mb-6 flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40">
									{isDetecting ? (
										<div className="animate-pulse">
											<Icon
												name="globe"
												className="h-5 w-5 text-text-soft-400"
											/>
										</div>
									) : (
										provider.icon
									)}
								</div>
								<div>
									<div className="flex items-center gap-1.5">
										<Icon name="server" className="h-3 w-3 text-text-sub-600" />
										<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
											Provider
										</span>
									</div>
									<h3 className="font-bold text-lg text-text-strong-950 leading-tight">
										{isDetecting ? "Scanning..." : provider.name}
									</h3>
									<p className="font-medium text-text-strong-950 text-xs underline decoration-stroke-soft-200 decoration-dashed underline-offset-4">
										{domain || "domain.com"}
									</p>
								</div>
							</div>
							<div
								className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs ${
									isConnected
										? "bg-success-lighter text-success-base"
										: "bg-bg-weak-50 text-text-soft-400"
								}`}
							>
								<div
									className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-success-base" : "animate-pulse bg-text-soft-400"}`}
								/>
								{isConnected
									? "Connected"
									: isDetecting
										? "Scanning"
										: "Re-check"}
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-paragraph-sm text-text-soft-400">
									Nameservers
								</span>
								<span className="font-mono text-paragraph-sm text-text-sub-600">
									ns1.
									{detectedProvider !== "unknown" ? detectedProvider : "dns"}
									.com
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-paragraph-sm text-text-soft-400">
									Zone ID
								</span>
								<span className="font-mono text-paragraph-sm text-text-sub-600">
									a1b2c3d4e5
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-paragraph-sm text-text-soft-400">
									Propagation
								</span>
								<span className="font-medium text-paragraph-sm text-text-sub-600">
									~2 min
								</span>
							</div>
						</div>
					</div>

					<button
						type="button"
						disabled={isConnecting || isConnected}
						onClick={handleAutoConnect}
						className="flex w-full items-center justify-center gap-2 border-stroke-soft-200 border-t bg-bg-weak-50/50 p-4 font-medium text-paragraph-sm text-text-strong-950 transition-all hover:bg-bg-weak-50 disabled:opacity-50 dark:border-stroke-soft-100/40"
					>
						<Icon
							name="refresh-cw"
							className={`h-4 w-4 ${isConnecting ? "animate-spin text-text-soft-400" : ""}`}
						/>
						Auto-populate DNS
						<span className="rounded bg-bg-white-0 px-1.5 py-0.5 text-[10px] text-text-soft-400 ring-1 ring-stroke-soft-200 ring-inset dark:ring-stroke-soft-100/40">
							1-click
						</span>
					</button>
				</div>

				{/* DNS Records Guide Card */}
				<div className="overflow-hidden rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<div className="border-stroke-soft-200 border-b bg-bg-weak-50/50 p-4 px-5 font-medium dark:border-stroke-soft-100/40">
						<h4 className="text-[10px] text-text-sub-600 uppercase tracking-wider">
							DNS Records Guide
						</h4>
					</div>
					<div className="space-y-4 p-5">
						{[
							{
								type: "A Record",
								desc: "Maps your apex domain to our core infrastructure.",
							},
							{
								type: "CNAME",
								desc: "Handles subdomains and necessary redirects.",
							},
							{
								type: "MX Records",
								desc: "Routes your incoming emails to our processing engine.",
							},
							{
								type: "SPF / TXT",
								desc: "Authenticates your domain to ensure high deliverability.",
							},
						].map((item, idx) => (
							<div key={idx} className="flex flex-col gap-0.5">
								<span className="font-bold text-[10px] text-text-strong-950 uppercase tracking-wider">
									{item.type}
								</span>
								<p className="text-paragraph-sm text-text-sub-600">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
