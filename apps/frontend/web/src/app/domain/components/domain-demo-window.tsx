"use client";

import { HeroWindowChrome } from "../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../(home)/components/hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../(home)/components/hero-demo-playback";
import { HeroDomainPreview } from "../../(home)/components/hero-domain-preview";

export function DomainDemoWindow() {
	return (
		<HeroDemoPlaybackProvider>
			<HeroWindowChrome action={<HeroDemoPlaybackButton />}>
				<HeroDashboardShell activeItem="domain">
					<HeroDomainPreview />
				</HeroDashboardShell>
			</HeroWindowChrome>
		</HeroDemoPlaybackProvider>
	);
}
