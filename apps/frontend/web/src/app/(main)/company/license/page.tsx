import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import type { Metadata } from "next";
import { LicenseFaq } from "./components/license-faq";
import { LicensePermissions } from "./components/license-permissions";
import { LicenseText } from "./components/license-text";

export const metadata: Metadata = {
	title: "License | Reloop",
	description:
		"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs. Review permitted uses, restrictions, and commercial licensing.",
	openGraph: {
		title: "License | Reloop",
		description:
			"Reloop is licensed under Apache License 2.0 with additional use restrictions from Reloop Labs.",
		type: "website",
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

3. For commercial licensing or partnerships, please contact:
   reloop.sh@gmail.com`;

const LicensePage = () => {
	return (
		<MarketingPageShell
			titleLines={["Apache 2.0 License"]}
			description="Reloop is open source under Apache 2.0 with additional use restrictions from Reloop Labs—free for personal and internal use."
			primaryCta={{
				label: "View on GitHub",
				href: "https://github.com/reloop-labs/reloop",
			}}
			secondaryCta={{
				label: "Contact for commercial use",
				href: "mailto:reloop.sh@gmail.com",
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
				titleMuted="For personal and internal use."
				description="Clone the repo and self-host—or reach out for commercial licensing."
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
