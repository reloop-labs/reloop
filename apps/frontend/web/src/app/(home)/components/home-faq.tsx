import { FaqSection } from "@reloop/web/components/faq-section";
import { homeFaqGroups } from "@reloop/web/lib/home-faq";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";

const linkClassName =
	"font-medium text-primary-base underline decoration-primary-base/30 underline-offset-4 transition-colors hover:decoration-primary-base dark:text-white dark:decoration-white/30 dark:hover:decoration-white";

export function HomeFaq() {
	return (
		<div className="border-stroke-soft-100 border-y dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
			<FaqSection
				groups={homeFaqGroups}
				id="faq-section"
				eyebrow="FAQ"
				title="Frequently asked questions."
				compact
				plain
				flush
			/>
			<div className="grid border-stroke-soft-100 border-t lg:grid-cols-[minmax(220px,1.45fr)_repeat(4,minmax(0,1fr))] dark:border-white/10">
				<div aria-hidden className="hidden lg:block" />
				<p className="col-span-full border-stroke-soft-100 px-5 py-10 text-[14px] text-text-sub-600 leading-[1.7] sm:px-7 sm:text-[15px] lg:col-span-4 lg:border-l lg:px-9 lg:py-12 dark:border-white/10 dark:text-white/55">
					Have any questions outside of these? Email us at{" "}
					<a href={`mailto:${contactEmail}`} className={linkClassName}>
						{contactEmail}
					</a>{" "}
					or join us on{" "}
					<a
						href={socialProfiles.discord}
						target="_blank"
						rel="noreferrer"
						className={linkClassName}
					>
						Discord
					</a>
					. We&rsquo;re happy to help!
				</p>
			</div>
		</div>
	);
}
