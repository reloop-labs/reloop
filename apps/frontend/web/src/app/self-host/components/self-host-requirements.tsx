import { Icon } from "@reloop/ui/icon";
import { AlignedIconBand } from "@reloop/web/app/sdk/components/section-frame";
import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";

const REQUIREMENTS = [
	{
		icon: "shield",
		title: "Open Cloud Ports",
		description:
			"Open ports 80/443 for web/API traffic, port 25 for SMTP inbound, and port 587 for submission in your cloud security group.",
	},
	{
		icon: "globe",
		title: "Domain & DNS Access",
		description:
			"Full control over domain DNS records to configure MX routing, SPF, DKIM, and DMARC authentication.",
	},
	{
		icon: "cpu",
		title: "System Requirements",
		description:
			"Minimum 1 vCPU, 2 GB RAM, and Docker Engine 24.0+ with Docker Compose v2 installed on your server.",
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
								<Icon name={req.icon} className="size-4" aria-hidden />
							</span>
							<div>
								<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{req.title}
								</h3>
								<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{req.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</AlignedIconBand>
		</section>
	);
}
