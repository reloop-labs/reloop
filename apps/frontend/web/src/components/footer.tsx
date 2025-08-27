import { Logo } from "@reloop/ui/components/logo";
import Link from "next/link";

export const Footer = () => {
	return (
		<footer>
			<div className="mx-auto border-stroke-soft-100 border-t border-b">
				<FooterTitle />
			</div>
			<div className="mx-auto border-stroke-soft-100 border-b">
				<FooterLinks />
			</div>
			<div className="-mb-10">
				<div className="relative">
					<p className="text-center font-bold text-[300px] text-outline text-stroke-soft-100 leading-96">
						Reloop
					</p>
					<div className="absolute inset-0 bottom-0 w-full bg-gradient-to-t from-white to-white/50 dark:from-black dark:to-black/70" />
				</div>
			</div>
		</footer>
	);
};

const FooterTitle = () => {
	return (
		<div className="mx-auto flex max-w-5xl flex-col items-start gap-5 border-stroke-soft-100 border-r border-l pt-10 pb-16">
			<div className="flex w-full flex-col items-center justify-center">
				<Logo className="h-16 w-16 rounded-full" />
				<p className="text-center font-medium text-[28px] leading-9">
					Reloop Mail
					<br />
					<span className="text-gray-500">Email Infrastructure.</span>
				</p>
			</div>
		</div>
	);
};

const FooterLinks = () => {
	return (
		<div className="mx-auto flex max-w-5xl flex-col items-start gap-5 border-stroke-soft-100 border-r border-l ">
			<div className="grid w-full grid-cols-5">
				<div className="border-stroke-soft-100 border-r py-10 pl-10">
					<p className="label-md pb-6">Product</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<Link href="/product/campaigns">
							<p>Campaigns</p>
						</Link>
						<Link href="/product/email-analytics">
							<p>Email Analytics</p>
						</Link>
						<Link href="/product/transaction-emails">
							<p>Transaction Emails</p>
						</Link>
						<Link href="/product/email-validation">
							<p>Email Validation</p>
						</Link>
						<Link href="/product/email-templates">
							<p>Email Templates</p>
						</Link>
						<Link href="/product/deliverability">
							<p>Deliverability</p>
						</Link>
					</div>
				</div>

				<div className="border-stroke-soft-100 border-r py-10 pl-10">
					<p className="label-md pb-6">Docs</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<Link href="/docs/getting-started">
							<p>Getting Started</p>
						</Link>
						<Link href="/docs/api-reference">
							<p>API Reference</p>
						</Link>
						<Link href="/docs/campaign-builder">
							<p>Campaign Builder</p>
						</Link>
						<Link href="/docs/integration">
							<p>Integration</p>
						</Link>
						<Link href="/docs/webhooks">
							<p>Webhooks</p>
						</Link>
						<Link href="/docs/SDKs">
							<p>SDKs</p>
						</Link>
					</div>
				</div>
				<div className="border-stroke-soft-100 border-r py-10 pl-10">
					<p className="label-md pb-6">Resources</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<Link href="/resources/changelog">
							<p>Changelog</p>
						</Link>
						<Link href="/resources/self-hosting-guide">
							<p>Self-hosting Guide</p>
						</Link>
						<Link href="/resources/status">
							<p>Status</p>
						</Link>
						<Link href="/resources/community">
							<p>Community</p>
						</Link>
						<Link href="/resources/glossary">
							<p>Glossary</p>
						</Link>
						<Link href="/resources/tools">
							<p>Tools</p>
						</Link>
					</div>
				</div>
				<div className="border-stroke-soft-100 border-r py-10 pl-10">
					<p className="label-md pb-6">Philosophy</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<Link href="/philosophy/why-reloop">
							<p>Why Reloop</p>
						</Link>
						<Link href="/philosophy/why-open-source">
							<p>Why Open-source</p>
						</Link>
						<Link href="/philosophy/what-we-stand-for">
							<p>What we stand for</p>
						</Link>
						<Link href="/philosophy/our-product-beliefs">
							<p>Our Product Beliefs</p>
						</Link>
						<Link href="/philosophy/engineering">
							<p>Engineering</p>
						</Link>
					</div>
				</div>
				<div className="border-stroke-soft-100 py-10 pl-10">
					<p className="label-md pb-6">Company</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<Link href="/company/about-us">
							<p>About Us</p>
						</Link>
						<Link href="/company/blog">
							<p>Blog</p>
						</Link>
						<Link href="/company/contact-us">
							<p>Contact Us</p>
						</Link>
						<Link href="/company/license">
							<p>License</p>
						</Link>
						<Link href="/company/terms-and-conditions">
							<p>Terms and Conditions</p>
						</Link>
						<Link href="/company/privacy">
							<p>Privacy Policy</p>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
