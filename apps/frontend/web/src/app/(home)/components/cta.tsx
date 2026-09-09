import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<BlogCta
			headline={
				<>
					Built for Developers
					<br />
					Available today.
				</>
			}
			sub=""
			primaryLabel="Get Started "
			primaryHref={hostedSignupHref}
			primaryVariant="primary"
			secondaryLabel="Schedule call"
			secondaryHref="https://cal.com/pranavp/30"
			secondaryExternal
			accentColor="blue"
			blast
			flush
			align="center"
			pill={false}
			showTopRule={false}
		/>
	);
}
