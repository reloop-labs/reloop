import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export function DomainCta() {
	return (
		<BlogCta
			headline={
				<span className="block font-semibold text-[3rem] leading-[1.04] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.25rem]">
					Start now
					<br />
					<span className="text-emerald-600 dark:text-emerald-400">$0 / mo.</span>
				</span>
			}
			sub="No credit card required. Unlimited domains with automated DNS verification."
			primaryLabel="Get started"
			primaryHref={hostedSignupHref}
			secondaryLabel="Domain docs"
			secondaryHref="/docs/learn/domain"
			accentHex="#059669"
			accentColor="emerald"
			primaryVariant="primary"
			align="center"
			flush
			pill={false}
			showTopRule={false}
		/>
	);
}
