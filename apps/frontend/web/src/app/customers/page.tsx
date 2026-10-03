import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/customers`;
const pageTitle = "Customers | Teams that run on Reloop";
const pageDescription =
	"Trusted by 250+ developers and used by people working at Chatbase, Instinct, Darkless, Ironwill Capital, Avanet, and True Heal.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"Reloop customers",
		"companies using Reloop",
		"Reloop case studies",
		"email infrastructure customers",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

type Customer = { name: string; src: string };

const customers: Customer[] = [
	{ name: "Chatbase", src: "/company-logos/chatbase.svg" },
	{ name: "Instinct", src: "/company-logos/instinct.png" },
	{ name: "Darkless", src: "/company-logos/darkless.svg" },
	{ name: "Ironwill Capital", src: "/company-logos/ironwillcapital.png" },
	{ name: "Avanet", src: "/company-logos/avanet.svg" },
	{ name: "True Heal", src: "/company-logos/trueheal.png" },
];

const customersSchema = {
	"@context": "https://schema.org",
	"@type": "CollectionPage",
	name: pageTitle,
	description: pageDescription,
	url: pageUrl,
};

export default function CustomersPage() {
	return (
		<section className="w-full overflow-hidden bg-white dark:bg-black">
			<JsonLd data={customersSchema} />
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
				<div className="grid gap-px bg-[#ebebeb] dark:bg-[#292929]">
					<div className="rounded-[4px] bg-white px-6 pt-24 pb-16 text-center md:pt-32 dark:bg-black">
						<p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
							Customers
						</p>
						<h1 className="mx-auto mt-4 max-w-2xl text-balance font-medium text-4xl text-zinc-950 leading-[1.1] tracking-tight md:text-5xl dark:text-white">
							Teams that run on Reloop
						</h1>
						<p className="mx-auto mt-5 max-w-xl text-balance text-base text-zinc-600 leading-relaxed md:text-lg dark:text-zinc-400">
							Trusted by{" "}
							<span className="font-semibold text-zinc-950 dark:text-white">
								250+ developers
							</span>{" "}
							and used by people working at these companies.
						</p>
					</div>
					<ul
						aria-label="Reloop customers"
						className="grid grid-cols-1 gap-px overflow-hidden rounded-[4px] bg-[#ebebeb] sm:grid-cols-2 lg:grid-cols-3 dark:bg-[#292929]"
					>
						{customers.map((customer) => (
							<li
								key={customer.name}
								className="flex min-h-56 items-center justify-center bg-white px-8 py-10 dark:bg-black"
							>
								{customer.name === "Instinct" ||
								customer.name === "True Heal" ? (
									<span className="flex items-center gap-2.5">
										<Image
											alt={customer.name}
											src={customer.src}
											width={27}
											height={71}
											loading="lazy"
											className="h-10 w-auto object-contain dark:invert"
										/>
										<span className="font-semibold text-lg text-zinc-950 tracking-tight dark:text-white">
											{customer.name}
										</span>
									</span>
								) : (
									<Image
										alt={customer.name}
										src={customer.src}
										width={200}
										height={64}
										loading="lazy"
										className="h-12 w-auto object-contain opacity-90 md:h-14 dark:invert"
									/>
								)}
							</li>
						))}
					</ul>
					<div className="flex flex-col items-center justify-between gap-6 rounded-[4px] bg-white px-8 py-10 text-center sm:flex-row sm:text-left dark:bg-black">
						<div>
							<p className="font-medium text-xl text-zinc-950 tracking-tight dark:text-white">
								Join them.
							</p>
							<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
								Send your first email in minutes with the Reloop
								API.
							</p>
						</div>
						<Link
							href="/pricing"
							className="shrink-0 rounded-full bg-zinc-950 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
						>
							Get started
						</Link>
					</div>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
