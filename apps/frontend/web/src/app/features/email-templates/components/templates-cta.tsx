import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { toolPath } from "../../../tools/email-html-editor/content";

export function TemplatesCta() {
	return (
		<BlogCta
			headline={
				<span className="block font-semibold text-[3rem] leading-[1.04] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.25rem]">
					Design once.
					<br />
					Send forever.
				</span>
			}
			sub=""
			primaryLabel="Get started"
			primaryHref={hostedSignupHref}
			secondaryLabel="Try the editor"
			secondaryHref={toolPath}
			primaryVariant="neutral"
			align="center"
			flush
			pill={false}
			showTopRule={false}
		/>
	);
}
