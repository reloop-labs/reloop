import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export function MarketingCta() {
	return (
		<BlogCta
			headline={
				<span className="block font-semibold text-[3rem] leading-[1.04] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.25rem]">
					Start now
					<br />
					<span className="text-orange-600 dark:text-orange-400">$0 / mo.</span>
				</span>
			}
			sub="No credit card required. 3,000 emails for free."
			primaryLabel="Get started"
			primaryHref={hostedSignupHref}
			secondaryLabel="View pricing"
			secondaryHref="/pricing"
			accentHex="#ea580c"
			accentColor="amber"
			primaryVariant="primary"
			align="center"
			flush
			pill={false}
			showTopRule={false}
		/>
	);
}
