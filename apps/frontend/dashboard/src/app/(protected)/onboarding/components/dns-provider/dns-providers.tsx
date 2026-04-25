import { cn } from "@reloop/ui/cn";
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
	renderIcon: (props: { className?: string }) => React.ReactNode;
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

			const renderIcon = ({ className }: { className?: string }) => {
				if (siIcon) {
					return (
						<span
							className={cn(
								"flex items-center justify-center [&>svg]:h-full [&>svg]:w-full",
								className,
							)}
							style={{ fill: `#${siIcon.hex}` }}
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted SVG from simple-icons
							dangerouslySetInnerHTML={{ __html: siIcon.svg }}
						/>
					);
				}

				return (
					<Icon
						name={value.iconName || "globe"}
						className={cn(value.textColor || "text-text-soft-400", className)}
					/>
				);
			};

			return [
				key,
				{
					...value,
					icon: renderIcon({ className: "size-7" }),
					renderIcon,
				},
			];
		},
	),
) as unknown as Record<ProviderKey, ProviderConfig>;
