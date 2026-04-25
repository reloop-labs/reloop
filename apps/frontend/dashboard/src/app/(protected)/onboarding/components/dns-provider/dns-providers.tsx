import { Icon } from "@reloop/ui/icon";
import type React from "react";
import * as simpleIcons from "simple-icons";
import providersData from "./dns-providers.json";

export type ProviderKey = keyof typeof providersData;

export interface ProviderConfig {
	name: string;
	color: string;
	borderColor: string;
	textColor: string;
	icon: React.ReactNode;
	url: string | null;
	supportsAutoConnect?: boolean;
}

interface RawProviderData {
	name: string;
	color: string;
	borderColor: string;
	textColor: string;
	iconSlug?: string;
	iconName?: string;
	url: string | null;
	supportsAutoConnect?: boolean;
}

export const PROVIDERS = Object.fromEntries(
	Object.entries(providersData as Record<string, RawProviderData>).map(
		([key, value]) => {
			const iconSlug = value.iconSlug;
			const siIcon = iconSlug
				? (simpleIcons as unknown as Record<string, simpleIcons.SimpleIcon>)[
						iconSlug
					] || null
				: null;

			const icon = siIcon ? (
				<span
					className="flex h-9 w-9 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
					style={{ fill: `#${siIcon.hex}` }}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted SVG from simple-icons
					dangerouslySetInnerHTML={{ __html: siIcon.svg }}
				/>
			) : (
				<Icon
					name={value.iconName || "globe"}
					className={`size-7 ${value.textColor || "text-text-soft-400"}`}
				/>
			);

			return [
				key,
				{
					...value,
					icon,
				},
			];
		},
	),
) as unknown as Record<ProviderKey, ProviderConfig>;
