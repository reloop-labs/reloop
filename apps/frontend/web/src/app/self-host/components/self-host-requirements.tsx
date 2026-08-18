import { Icon } from "@reloop/ui/icon";
import { AlignedIconBand } from "@reloop/web/app/sdk/components/section-frame";
import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";

const REQUIREMENTS = [
	{
		icon: "shield",
		title: "Open Cloud Ports",
		points: [
			{
				highlight: "Port 80 & 443",
				text: "Web UI & REST API traffic",
			},
			{
				highlight: "Port 25",
				text: "Inbound SMTP mail receiving",
			},
			{
				highlight: "Port 587",
				text: "Authenticated mail submission",
			},
		],
	},
	{
		icon: "cpu",
		title: "System Requirements",
		points: [
			{
				highlight: "4–8 vCPUs & 8–16 GB RAM",
				text: "Base compute footprint",
			},
			{
				highlight: "Docker Engine 24.0+",
				text: "With Docker Compose v2",
			},
			{
				highlight: "PostgreSQL 15+ & Redis 7+",
				text: "Database and queue runtime",
			},
		],
	},
	{
		icon: "globe",
		title: "Domain & Subdomains",
		points: [
			{
				highlight: "app.{YOUR_DOMAIN}",
				text: "Web Dashboard & unified API",
			},
			{
				highlight: "inbound.{YOUR_DOMAIN}",
				text: "Inbound MX mail receiving",
			},
			{
				highlight: "smtp.{YOUR_DOMAIN}",
				text: "Outbound authenticated SMTP",
			},
			{
				highlight: "link.{YOUR_DOMAIN}",
				text: "Click tracking & open pixels",
			},
		],
	},
] as const;

function ServerCustomIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<g data-transform-wrapper="on" transform="translate(24 0) scale(-1 1)">
				<g fill="none">
					<path
						d="M12 11L22 6V18L12 23V11Z"
						fill="currentColor"
						fillOpacity="0.3"
					/>
					<path d="M9 2.5L19 7.5V19.5" stroke="currentColor" />
					<path d="M2 10L12 15L22 10" stroke="currentColor" />
					<path d="M2 14L12 19L22 14" stroke="currentColor" />
					<path d="M12 11V23" stroke="currentColor" />
					<path
						d="M22 6L12.4472 10.7764C12.1657 10.9172 11.8343 10.9172 11.5528 10.7764L2 6"
						stroke="currentColor"
					/>
					<path
						d="M21.4472 5.72361L12.6708 1.33541C12.2485 1.12426 11.7515 1.12426 11.3292 1.33541L2.55279 5.72361C2.214 5.893 2 6.23926 2 6.61803V17.382C2 17.7607 2.214 18.107 2.55279 18.2764L11.3292 22.6646C11.7515 22.8757 12.2485 22.8757 12.6708 22.6646L21.4472 18.2764C21.786 18.107 22 17.7607 22 17.382V6.61803C22 6.23926 21.786 5.893 21.4472 5.72361Z"
						stroke="currentColor"
					/>
					<path d="M10 20H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M10 16H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M10 12H10.01" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 9L5 9.5" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 13L5 13.5" stroke="currentColor" strokeLinecap="round" />
					<path d="M4 17L5 17.5" stroke="currentColor" strokeLinecap="round" />
				</g>
			</g>
		</svg>
	);
}

function CpuCustomIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<path
				opacity="0.12"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M20 10.4C20 8.15979 20 7.03969 19.564 6.18404C19.1805 5.43139 18.5686 4.81947 17.816 4.43597C16.9603 4 15.8402 4 13.6 4H10.4C8.15979 4 7.03969 4 6.18404 4.43597C5.43139 4.81947 4.81947 5.43139 4.43597 6.18404C4 7.03969 4 8.15979 4 10.4V13.6C4 15.8402 4 16.9603 4.43597 17.816C4.81947 18.5686 5.43139 19.1805 6.18404 19.564C7.03969 20 8.15979 20 10.4 20H13.6C15.8402 20 16.9603 20 17.816 19.564C18.5686 19.1805 19.1805 18.5686 19.564 17.816C20 16.9603 20 15.8402 20 13.6V10.4ZM9.16349 9.81901C9 10.1399 9 10.5599 9 11.4V12.6C9 13.4401 9 13.8601 9.16349 14.181C9.3073 14.4632 9.53677 14.6927 9.81901 14.8365C10.1399 15 10.5599 15 11.4 15H12.6C13.4401 15 13.8601 15 14.181 14.8365C14.4632 14.6927 14.6927 14.4632 14.8365 14.181C15 13.8601 15 13.4401 15 12.6V11.4C15 10.5599 15 10.1399 14.8365 9.81901C14.6927 9.53677 14.4632 9.3073 14.181 9.16349C13.8601 9 13.4401 9 12.6 9H11.4C10.5599 9 10.1399 9 9.81901 9.16349C9.53677 9.3073 9.3073 9.53677 9.16349 9.81901Z"
				fill="currentColor"
			/>
			<path
				d="M8 4V2M8 22V20M2 8H4M20 8H22M12 4V2M12 22V20M2 12H4M20 12H22M16 4V2M16 22V20M2 16H4M20 16H22M11.4 15H12.6C13.4401 15 13.8601 15 14.181 14.8365C14.4632 14.6927 14.6927 14.4632 14.8365 14.181C15 13.8601 15 13.4401 15 12.6V11.4C15 10.5599 15 10.1399 14.8365 9.81901C14.6927 9.53677 14.4632 9.3073 14.181 9.16349C13.8601 9 13.4401 9 12.6 9H11.4C10.5599 9 10.1399 9 9.81901 9.16349C9.53677 9.3073 9.3073 9.53677 9.16349 9.81901C9 10.1399 9 10.5599 9 11.4V12.6C9 13.4401 9 13.8601 9.16349 14.181C9.3073 14.4632 9.53677 14.6927 9.81901 14.8365C10.1399 15 10.5599 15 11.4 15ZM10.4 20H13.6C15.8402 20 16.9603 20 17.816 19.564C18.5686 19.1805 19.1805 18.5686 19.564 17.816C20 16.9603 20 15.8402 20 13.6V10.4C20 8.15979 20 7.03968 19.564 6.18404C19.1805 5.43139 18.5686 4.81947 17.816 4.43597C16.9603 4 15.8402 4 13.6 4H10.4C8.15979 4 7.03968 4 6.18404 4.43597C5.43139 4.81947 4.81947 5.43139 4.43597 6.18404C4 7.03968 4 8.15979 4 10.4V13.6C4 15.8402 4 16.9603 4.43597 17.816C4.81947 18.5686 5.43139 19.1805 6.18404 19.564C7.03968 20 8.15979 20 10.4 20Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function SelfHostRequirements() {
	return (
		<section id="requirements" className="w-full">
			<SectionTitle
				title="Requirements"
				icon={
					<ServerCustomIcon className="size-5 text-text-strong-950 dark:text-white" />
				}
			/>

			<AlignedIconBand>
				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-3 dark:bg-white/10">
					{REQUIREMENTS.map((req) => (
						<div
							key={req.title}
							className="flex flex-col items-start gap-4 bg-bg-white-0 p-6 sm:p-7 dark:bg-black"
						>
							<span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50/50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
								{req.icon === "cpu" ? (
									<CpuCustomIcon className="size-4" />
								) : (
									<Icon name={req.icon} className="size-4" aria-hidden />
								)}
							</span>
							<div className="w-full">
								<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{req.title}
								</h3>
								<ul className="mt-2.5 space-y-1.5">
									{req.points.map((point) => (
										<li
											key={point.highlight}
											className="flex items-start gap-2 text-[13px] leading-relaxed"
										>
											<span className="mt-2 size-1 shrink-0 rounded-full bg-text-sub-600/60 dark:bg-white/40" />
											<span className="text-text-sub-600 dark:text-white/60">
												<strong className="font-medium text-text-strong-950 dark:text-white">
													{point.highlight}:
												</strong>{" "}
												{point.text}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</AlignedIconBand>
		</section>
	);
}
