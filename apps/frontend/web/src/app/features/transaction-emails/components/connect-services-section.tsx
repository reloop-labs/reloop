import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AutoScrollRow } from "@reloop/web/components/landing/auto-scroll-row";
import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siCloudflare,
	siCoolify,
	siDocker,
	siGhost,
	siMake,
	siN8n,
	siNetlify,
	siStrapi,
	siSupabase,
	siVercel,
	siWordpress,
	siZapier,
} from "simple-icons";
import { isDarkBrandColor } from "../../../sdk/components/language-icon";

export type Service = { label: string; href: string; icon: SimpleIcon };

const SERVICES: Service[] = [
	{
		label: "WordPress",
		href: "/docs/integrations/wordpress",
		icon: siWordpress,
	},
	{
		label: "Supabase",
		href: "/docs/guides/supabase-quickstart",
		icon: siSupabase,
	},
	{ label: "Zapier", href: "/docs/integrations/zapier", icon: siZapier },
	{ label: "n8n", href: "/docs/integrations/n8n", icon: siN8n },
	{ label: "Docker", href: "/docs/integrations/docker", icon: siDocker },
	{ label: "Make", href: "/docs/integrations/make", icon: siMake },
	{
		label: "Cloudflare",
		href: "/docs/integrations/cloudflare",
		icon: siCloudflare,
	},
	{ label: "Strapi", href: "/docs/integrations/strapi", icon: siStrapi },
	{ label: "Netlify", href: "/docs/integrations/netlify", icon: siNetlify },
	{ label: "Ghost", href: "/docs/integrations/ghost", icon: siGhost },
	{ label: "Coolify", href: "/docs/integrations/coolify", icon: siCoolify },
	{ label: "Vercel", href: "/docs/integrations/vercel", icon: siVercel },
];

function ServiceTile({ service }: { service: Service }) {
	// Near-black brands (Vercel, Ghost, Make) use the text color so they stay
	// visible in dark mode.
	const dark = isDarkBrandColor(service.icon.hex);

	return (
		<a
			href={service.href}
			className="group relative flex size-full bg-bg-white-0 transition-colors duration-200 hover:z-10 dark:bg-black"
		>
			<svg
				viewBox="0 0 24 24"
				aria-hidden
				className={cn(
					"group-hover:-translate-y-3 relative m-auto size-10 duration-200 ease-out",
					dark && "text-text-strong-950 dark:text-white",
				)}
			>
				<path
					d={service.icon.path}
					fill={dark ? "currentColor" : `#${service.icon.hex}`}
				/>
			</svg>
			<span className="pointer-events-none absolute inset-0 m-auto block size-fit translate-y-[125%] font-medium text-sm text-text-strong-950 opacity-0 duration-200 group-hover:opacity-100 dark:text-white">
				{service.label}
			</span>
		</a>
	);
}

export function ConnectServicesSection({
	services = SERVICES,
	title = (
		<>
			Connect easily
			<br />
			with any service
		</>
	),
	description = "Add Reloop to your existing stack, with the tools you already know and love.",
}: {
	services?: Service[];
	title?: ReactNode;
	description?: string;
} = {}) {
	return (
		<section
			id="connect-services"
			aria-labelledby="connect-services-heading"
			className="w-full overflow-hidden bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="clock" className="size-3.5" aria-hidden />
					Quick integration
				</span>
				<h2
					id="connect-services-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					{title}
				</h2>
				<p className="mt-3 max-w-md text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					{description}
				</p>
			</div>

			<AutoScrollRow label="Services that work with Reloop">
				{services.map((service) => (
					<div
						key={service.label}
						className="size-36 shrink-0 border-stroke-soft-100 border-r sm:size-44 dark:border-white/10"
					>
						<ServiceTile service={service} />
					</div>
				))}
			</AutoScrollRow>
		</section>
	);
}
