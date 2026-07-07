import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { LicenseFaq } from "./components/license-faq";
import { LicensePermissions } from "./components/license-permissions";
import { LicenseText } from "./components/license-text";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/license`;

export const metadata: Metadata = {
	title: "License | Reloop",
	description:
		"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs. Review permitted uses, hosted service, and self-hosting options.",
	keywords: [
		"Reloop license",
		"Apache 2.0 license",
		"open source email license",
		"email platform license",
		"self-hosting license",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions.",
	},
};

const LICENSE_TEXT = `Copyright (c) 2025 Reloop Labs

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

----------------------------------------------------------------------
ADDITIONAL USE RESTRICTIONS (Custom Clause by Reloop Labs)
----------------------------------------------------------------------

1. You are free to use, copy, modify, and distribute this software for
   personal use and internal company purposes.

2. You are NOT permitted to:
   - Sell, sublicense, or otherwise commercially redistribute this software.
   - Offer this software, or any modified version of it, as a hosted service
     (including but not limited to Software-as-a-Service, Platform-as-a-Service,
     or any similar commercial hosting model).
   - Use this software in any product or service whose primary purpose is to
     compete with Reloop Labs.

3. Reloop Labs offers Reloop as a hosted email service, or you may
   self-host the open-source software on your own infrastructure.
   There is no commercial license for third parties to resell or
   offer competing hosted services using this software.

   For questions about the license or project, contact:
   reloop.sh@gmail.com`;

const LicensePage = () => {
	return (
		<MarketingPageShell
			titleLines={["Apache 2.0 License"]}
			description="Apache 2.0 with Reloop Labs terms—use our hosted email service or self-host the open-source platform."
			primaryCta={{
				label: "Get started",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Self-hosting guide",
				href: "/docs/self-host",
			}}
			compactHero
		>
			<PageSection narrow flushTop>
				<LicenseText>{LICENSE_TEXT}</LicenseText>
			</PageSection>

			<PageSection>
				<LicensePermissions />
			</PageSection>

			<LicenseFaq />

			<FeatureCta
				title="Ready to use Reloop?"
				titleMuted="Hosted or self-hosted."
				description="Sign up for our email service, or clone the repo and deploy Reloop on infrastructure you control."
				primary={{ label: "Get started", href: "/dashboard/signup" }}
				secondary={{
					label: "Self-hosting guide",
					href: "/docs/self-host",
				}}
			/>
		</MarketingPageShell>
	);
};

export default LicensePage;
