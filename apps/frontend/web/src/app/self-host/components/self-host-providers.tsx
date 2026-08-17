import { Icon } from "@reloop/ui/icon";
import { AlignedIconBand } from "@reloop/web/app/sdk/components/section-frame";
import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import {
	siCloudflare,
	siCoolify,
	siDigitalocean,
	siDocker,
	siFlydotio,
	siGooglecloud,
	siHetzner,
	siKubernetes,
	siRailway,
	siRender,
	siVultr,
} from "simple-icons";

type BrandIconData = Pick<SimpleIcon, "title" | "slug" | "hex" | "path">;

const siAmazonaws: BrandIconData = {
	title: "Amazon AWS",
	slug: "amazonaws",
	hex: "FF9900",
	path: "M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z",
};

export type ServerProvider = {
	name: string;
	slug: string;
	icon: BrandIconData;
	description: string;
	href?: string;
};

export const SERVER_PROVIDERS: ServerProvider[] = [
	{
		name: "Coolify",
		slug: "coolify",
		icon: siCoolify,
		description: "1-Click self-hosted PaaS template",
		href: "/docs",
	},
	{
		name: "AWS",
		slug: "aws",
		icon: siAmazonaws,
		description: "EC2, ECS, or EKS clusters",
		href: "/docs",
	},
	{
		name: "DigitalOcean",
		slug: "digitalocean",
		icon: siDigitalocean,
		description: "Droplets & Managed Kubernetes",
		href: "/docs",
	},
	{
		name: "Cloudflare",
		slug: "cloudflare",
		icon: siCloudflare,
		description: "Tunnels and Workers edge routing",
		href: "/docs",
	},
	{
		name: "Hetzner",
		slug: "hetzner",
		icon: siHetzner,
		description: "Bare-metal & cloud VPS instances",
		href: "/docs",
	},
	{
		name: "Railway",
		slug: "railway",
		icon: siRailway,
		description: "Instant deploy with managed Postgres",
		href: "/docs",
	},
	{
		name: "Fly.io",
		slug: "fly-io",
		icon: siFlydotio,
		description: "Global edge Docker micro-VMs",
		href: "/docs",
	},
	{
		name: "Render",
		slug: "render",
		icon: siRender,
		description: "Web services & background workers",
		href: "/docs",
	},
	{
		name: "Google Cloud",
		slug: "gcp",
		icon: siGooglecloud,
		description: "Compute Engine & GKE clusters",
		href: "/docs",
	},
	{
		name: "Vultr",
		slug: "vultr",
		icon: siVultr,
		description: "High frequency compute & bare metal",
		href: "/docs",
	},
	{
		name: "Docker",
		slug: "docker",
		icon: siDocker,
		description: "Standard Compose on any Linux host",
		href: "/docs",
	},
	{
		name: "Kubernetes",
		slug: "kubernetes",
		icon: siKubernetes,
		description: "Production Helm charts & ingress",
		href: "/docs",
	},
];

function ProviderIcon({ icon }: { icon: BrandIconData }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-4.5 transition-transform duration-200 group-hover:scale-110"
			aria-hidden
		>
			<path d={icon.path} fill={`#${icon.hex}`} />
		</svg>
	);
}

export function SelfHostProviders() {
	return (
		<section id="providers" className="w-full">
			<SectionTitle
				title="Host on the servers you love."
				icon="server"
				action={
					<Link
						href="/docs"
						className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<span>View all guides</span>
						<Icon
							name="arrow-right"
							className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				}
			/>

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-2 gap-px bg-stroke-soft-200 sm:grid-cols-3 lg:grid-cols-6 dark:bg-white/10">
					{SERVER_PROVIDERS.map((provider) => (
						<Link
							key={provider.slug}
							href={provider.href ?? "/docs"}
							className="group flex flex-col items-start justify-between gap-3 bg-bg-white-0 p-4 transition-colors duration-200 hover:bg-bg-weak-50/70 sm:p-5 dark:bg-black dark:hover:bg-white/[0.03]"
						>
							<div className="flex w-full items-start justify-between gap-2">
								<span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.04]">
									<ProviderIcon icon={provider.icon} />
								</span>
								<Icon
									name="arrow-right"
									className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
									aria-hidden
								/>
							</div>
							<div>
								<span className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
									{provider.name}
								</span>
								<p className="mt-0.5 line-clamp-1 text-[11.5px] text-text-sub-600 dark:text-white/50">
									{provider.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</AlignedIconBand>
		</section>
	);
}
