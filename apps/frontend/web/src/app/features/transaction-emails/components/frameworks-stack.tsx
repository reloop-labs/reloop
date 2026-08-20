import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import {
	siAuth0,
	siDjango,
	siLaravel,
	siMetabase,
	siN8n,
	siNestjs,
	siNodedotjs,
	siPhp,
	siRubyonrails,
	siShopify,
	siSpring,
	siSupabase,
	siWordpress,
	siZapier,
} from "simple-icons";
import { SceneHeader } from "../../../(home)/components/_shared/scene-header";
import {
	AlignedIconBand,
	SectionFrame,
} from "../../../sdk/components/section-frame";

type Integration = {
	label: string;
	href: string;
	icon: SimpleIcon;
};

const integrations: Integration[] = [
	{
		label: "WordPress",
		href: "/docs/integrations/wordpress",
		icon: siWordpress,
	},
	{
		label: "Laravel",
		href: "/docs/examples/smtp/introduction",
		icon: siLaravel,
	},
	{
		label: "n8n",
		href: "/docs/integrations/n8n",
		icon: siN8n,
	},
	{
		label: "Nodemailer",
		href: "/docs/examples/smtp/nodemailer",
		icon: siNodedotjs,
	},
	{
		label: "Django",
		href: "/docs/examples/smtp/introduction",
		icon: siDjango,
	},
	{
		label: "Metabase",
		href: "/docs/examples/smtp/introduction",
		icon: siMetabase,
	},
	{
		label: "Rails",
		href: "/docs/examples/smtp/ruby",
		icon: siRubyonrails,
	},
	{
		label: "Auth0",
		href: "/docs/examples/smtp/introduction",
		icon: siAuth0,
	},
	{
		label: "Supabase",
		href: "/docs/guides/supabase-quickstart",
		icon: siSupabase,
	},
	{
		label: "Zapier",
		href: "/docs/integrations/zapier",
		icon: siZapier,
	},
	{
		label: "NestJS",
		href: "/docs/examples/smtp/introduction",
		icon: siNestjs,
	},
	{
		label: "PHPMailer",
		href: "/docs/examples/smtp/php",
		icon: siPhp,
	},
	{
		label: "Spring",
		href: "/docs/examples/smtp/introduction",
		icon: siSpring,
	},
	{
		label: "Shopify",
		href: "/docs/examples/smtp/introduction",
		icon: siShopify,
	},
];

export function FrameworksStack() {
	return (
		<SectionFrame id="integrations" framed={false} showTopRule={false}>
			<div className="px-4 pt-12 sm:px-8 sm:pt-14 lg:px-12">
				<SceneHeader
					icon="shapes"
					color="orange"
					badge="Integrations"
					title="Connect easily with any service."
					description="No extra setup — plug Reloop into the mailer or platform you already use."
					ctaLabel="Explore all integrations"
					ctaHref="/docs/integrations"
					withDivider={true}
				/>
			</div>

			{/* Hatched side gutters align icon columns with the title padding above */}
			<AlignedIconBand>
				<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-7 dark:bg-white/10">
					{integrations.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							className="group flex flex-col items-start gap-2 bg-white p-4 transition-colors duration-200 hover:bg-[#f7f7f7] sm:p-5 dark:bg-black dark:hover:!bg-[#0A0A0A]"
						>
							<div className="flex w-full items-start justify-between gap-2">
								<span
									className={cn(
										"inline-flex size-8 items-center justify-center rounded-[10px] border border-stroke-soft-200 dark:border-white/10",
									)}
									style={{
										backgroundColor: `#${item.icon.hex}15`,
									}}
								>
									<svg viewBox="0 0 24 24" className="size-4" aria-hidden>
										<path d={item.icon.path} fill={`#${item.icon.hex}`} />
									</svg>
								</span>
								<Icon
									name="arrow-right"
									className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
									aria-hidden
								/>
							</div>
							<span className="pl-0.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
								{item.label}
							</span>
						</Link>
					))}
				</div>
			</AlignedIconBand>
		</SectionFrame>
	);
}





