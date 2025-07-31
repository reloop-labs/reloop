import { Logo } from "@reloop/ui/components/logo";

export const Footer = () => {
	return (
		<footer>
			<div className="mx-auto border-gray-200 border-t border-b border-dashed">
				<FooterTitle />
			</div>
			<div className="mx-auto border-gray-200 border-b border-dashed">
				<FooterLinks />
			</div>
			<div className="relative">
				<p className="text-center font-bold text-[300px] text-gray-400 text-outline leading-96">
					Reloop
				</p>
				<div className="absolute inset-0 bottom-0 w-full bg-gradient-to-t from-white to-white/0" />
			</div>
		</footer>
	);
};

const FooterTitle = () => {
	return (
		<div className="mx-auto flex max-w-5xl flex-col items-start gap-5 border-gray-200 border-r border-l border-dashed pt-10 pb-16">
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
		<div className="mx-auto flex max-w-5xl flex-col items-start gap-5 border-gray-200 border-r border-l border-dashed">
			<div className="grid w-full grid-cols-5">
				<div className="border-gray-200 border-r border-dashed py-10 pl-10">
					<p className="label-md pb-6">Product</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<p>Campaigns</p>
						<p>Email Analytics</p>
						<p>Transaction Emails</p>
						<p>Email Validation</p>
						<p>Email Templates</p>
						<p>Deliverable</p>
					</div>
				</div>

				<div className="border-gray-200 border-r border-dashed py-10 pl-10">
					<p className="label-md pb-6">Docs</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<p>Getting Started</p>
						<p>API Reference</p>
						<p>Campain Builder</p>
						<p>Integration</p>
						<p>Webhooks</p>
						<p>SDKs</p>
					</div>
				</div>
				<div className="border-gray-200 border-r border-dashed py-10 pl-10">
					<p className="label-md pb-6">Resources</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<p>Changelog</p>
						<p>Self-hosting Guide</p>
						<p>Status</p>
						<p>Community</p>
						<p>Glossary</p>
					</div>
				</div>
				<div className="border-gray-200 border-r border-dashed py-10 pl-10">
					<p className="label-md pb-6">Philosophy</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<p>Why Reloop</p>
						<p>Why Open-source</p>
						<p>What we stand for</p>
						<p>Our Product Beliefs</p>
						<p>Engineering</p>
					</div>
				</div>
				<div className="border-gray-200 border-r border-dashed py-10 pl-10">
					<p className="label-md pb-6">Company</p>
					<div className="flex flex-col gap-3 text-[15px] text-gray-600">
						<p>About us</p>
						<p>Blog</p>
						<p>Contact us</p>
						<p>License</p>
					</div>
				</div>
			</div>
		</div>
	);
};
