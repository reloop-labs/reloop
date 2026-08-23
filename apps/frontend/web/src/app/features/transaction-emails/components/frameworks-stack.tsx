import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Divider from "@reloop/ui/divider";
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
				<div>
					<div className="mb-3.5">
						<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
							<Icon name="shapes" className="size-3.5" />
							Integrations
						</span>
					</div>

					<h3 className="font-semibold text-[2rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[2.4rem] lg:text-[2.65rem] dark:text-white">
						Connect easily with any service.
					</h3>

					<p className="mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
						No extra setup — plug Reloop into the mailer or platform you already
						use.
					</p>

					<div className="mt-6">
						<Button.Root variant="neutral" mode="stroke" size="small" asChild>
							<Link href="/docs/integrations">
								Explore all integrations
								<Icon
									name="arrow-right"
									className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</Link>
						</Button.Root>
					</div>

					<Divider.Root className="mt-8 -mx-4 sm:-mx-8 lg:-mx-12 !w-auto dark:before:bg-white/10" />
				</div>
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





