import {
	CodeBlock,
	ContentCard,
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "License | Reloop",
	description:
		"Reloop is released under the MIT License. Learn how you can use, modify, and distribute our open-source email infrastructure.",
	openGraph: {
		title: "License | Reloop",
		description: "Reloop is released under the MIT License.",
		type: "website",
	},
};

const MIT_LICENSE = `MIT License

Copyright (c) 2024 Reloop Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const LicensePage = () => {
	return (
		<MarketingPageShell
			titleLines={["MIT License"]}
			description="Reloop is open source under the MIT License—free to use in commercial and personal projects with minimal obligations."
			primaryCta={{
				label: "View on GitHub",
				href: "https://github.com/reloop-labs/reloop",
			}}
			secondaryCta={{ label: "Get started", href: "/dashboard/signup" }}
		>
			<PageSection>
				<SectionHeading
					title="What the MIT License means"
					description="Simple, permissive, and business-friendly."
				/>
				<div className={cardGridClass}>
					{[
						{
							title: "Commercial use",
							description:
								"Build and sell products that incorporate Reloop without additional fees.",
						},
						{
							title: "Modification",
							description:
								"Customize features, fix bugs, or extend the platform for your needs.",
						},
						{
							title: "Distribution",
							description:
								"Share copies of Reloop, including modified versions, with your users.",
						},
						{
							title: "Private use",
							description:
								"Run Reloop internally without obligation to publish your changes.",
						},
					].map((item) => (
						<ContentCard key={item.title}>
							<h3 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
								{item.title}
							</h3>
							<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
								{item.description}
							</p>
						</ContentCard>
					))}
				</div>
			</PageSection>

			<PageSection alt narrow>
				<SectionHeading
					title="MIT License"
					description="The complete license text that applies to Reloop."
					center
				/>
				<CodeBlock>{MIT_LICENSE}</CodeBlock>
			</PageSection>

			<PageSection narrow>
				<SectionHeading title="Frequently asked questions" center={false} />
				<div className="space-y-4">
					{[
						{
							q: "Can I use Reloop in a commercial project?",
							a: "Yes. The MIT License explicitly allows commercial use without royalties or copyleft requirements.",
						},
						{
							q: "Do I need to include the license?",
							a: "Yes—include the MIT License text and copyright notice when you distribute the software.",
						},
						{
							q: "Can I modify Reloop without sharing changes?",
							a: "For private use, yes. If you distribute a modified version, include the original license and notice.",
						},
					].map((faq) => (
						<ContentCard key={faq.q}>
							<h3 className="mb-2 font-semibold text-text-strong-950 dark:text-white">
								{faq.q}
							</h3>
							<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
								{faq.a}
							</p>
						</ContentCard>
					))}
				</div>
			</PageSection>

			<FeatureCta
				title="Ready to use Reloop?"
				titleMuted="Under the MIT License."
				description="Clone the repo, self-host, or use our cloud—same freedom to build."
				primary={{ label: "Get started", href: "/dashboard/signup" }}
				secondary={{
					label: "View source code",
					href: "https://github.com/reloop-labs/reloop",
				}}
			/>
		</MarketingPageShell>
	);
};

export default LicensePage;
