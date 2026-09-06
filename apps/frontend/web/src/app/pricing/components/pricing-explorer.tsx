"use client";

import { PageSection } from "@reloop/web/components/page-shell";
import { useState } from "react";
import { PricingSection } from "./pricing-section";
import {
	PricingVolumeSlider,
	recommendPlanIdForVolume,
} from "./pricing-volume-slider";

export function PricingExplorer() {
	const [volume, setVolume] = useState(100000);

	return (
		<>
			<PricingVolumeSlider volume={volume} onVolumeChange={setVolume} />
			<PageSection flushTop flushBottom>
				<PricingSection
					recommendedPlanId={recommendPlanIdForVolume(volume)}
					volume={volume}
				/>
			</PageSection>
		</>
	);
}
