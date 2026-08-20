import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export function TransactionalCta() {
	return (
		<BlogCta
			headline={
				<span className="block font-semibold text-[3rem] leading-[1.04] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.25rem]">
					Start now
					<br />
					<span className="text-[#f97316]">$0 / mo.</span>
				</span>
			}
			sub="No credit card required. 3,000 emails for free."
			primaryLabel="Get started"
			primaryHref={hostedSignupHref}
			secondaryLabel="View pricing"
			secondaryHref="/pricing"
			accentHex="#f97316"
			accentColor="amber"
			align="center"
			flush
			pill={false}
			showTopRule={false}
		/>
	);
}
