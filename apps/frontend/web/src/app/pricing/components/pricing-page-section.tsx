"use client";

import { PricingUiProvider } from "@reloop/ui/pricing/cta";
import { PageSection } from "@reloop/web/components/page-shell";
import type { ReactNode } from "react";

function FlushSection({ children }: { children: ReactNode }) {
	return (
		<PageSection flushTop flushBottom>
			{children}
		</PageSection>
	);
}

/** Marketing layout for the shared pricing explorer. */
export function PricingPageSection({ children }: { children: ReactNode }) {
	return (
		<PricingUiProvider Section={FlushSection}>{children}</PricingUiProvider>
	);
}
