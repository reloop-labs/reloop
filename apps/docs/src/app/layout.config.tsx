import { Icon } from "@reloop/ui/components/icon";
import { Logo } from "@reloop/ui/components/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

export const baseOptions: BaseLayoutProps = {
	nav: {
		title: <Logo className="h-10 w-10" />,
	},
	// see https://fumadocs.dev/docs/ui/navigation/links
	links: [
		{
			icon: <Icon name="terminal" />,
			text: "How to Contribute",
			url: "/how-to-contribute",
			// secondary items will be displayed differently on navbar
			secondary: false,
		},
		{
			icon: <Icon name="terminal" />,
			text: "How to Selfhost",
			url: "/how-to-contribute",
			// secondary items will be displayed differently on navbar
			secondary: false,
		},
		{
			icon: <Icon name="terminal" />,
			text: "Blog",
			url: "/blog",
			// secondary items will be displayed differently on navbar
			secondary: false,
		},
	],
};
