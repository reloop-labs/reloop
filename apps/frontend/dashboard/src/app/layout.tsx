import type { Metadata } from "next";
import "../styles.css";
import { Providers } from "./providers";

// TODO: Remove this opt-out after the dashboard supports Cache Components.
export const instant = false;

export const metadata: Metadata = {
	title: "Reloop Dashboard",
	description: "Reloop Dashboard",
	manifest: "/dashboard/manifest.json",
	icons: {
		icon: [
			{ url: "/dashboard/favicon.ico" },
			{ url: "/dashboard/icon0.svg", type: "image/svg+xml" },
			{ url: "/dashboard/icon1.png", type: "image/png" },
		],
		apple: "/dashboard/apple-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-bg-white-0 font-sans text-text-strong-950 antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
