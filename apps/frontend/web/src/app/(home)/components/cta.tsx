import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";

export default function CTA() {
	return (
		<BlogCta
			headline={
				<>
					Built for developers
					<br />
					Available today.
				</>
			}
			sub=""
			primaryLabel="Get Started "
			primaryHref={hostedSignupHref}
			secondaryLabel="Contact us"
			secondaryHref="/contact"
			accentColor="primary"
			flush
			align="center"
			pill={false}
			showTopRule={false}
		/>
	);
}
