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
		// {
		// 	icon: <Icon name="terminal" />,
		// 	text: "Project Structure",
		// 	url: "/project-structure",
		// 	// secondary items will be displayed differently on navbar
		// 	secondary: false,
		// },
		// {
		// 	icon: <Icon name="terminal" />,
		// 	text: "How to Contribute",
		// 	url: "/docs/how-to-contribute",
		// 	// secondary items will be displayed differently on navbar
		// 	secondary: false,
		// },
		// {
		// 	icon: <Icon name="terminal" />,
		// 	text: "test1",
		// 	url: "/docs/test1",
		// 	// secondary items will be displayed differently on navbar
		// 	secondary: false,
		// },
		// {
		// 	icon: <Icon name="terminal" />,
		// 	text: "Local Setup",
		// 	url: "/local-setup",
		// 	// secondary items will be displayed differently on navbar
		// 	secondary: false,
		// },
		{
			icon: <Icon name="terminal" />,
			text: "How to Contribute",
			url: "/how-to-contribute",
		},

		{
			icon: <Icon name="terminal" />,
			text: "How to Self Host",
			url: "/how-to-self-host",
		},
	],
};
