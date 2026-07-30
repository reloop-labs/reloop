import { LinksLanding } from "@reloop/links/components/links-landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Email preferences",
	description: "Manage your email subscription preferences.",
	robots: { index: true, follow: true },
};

export default function HomePage() {
	return <LinksLanding />;
}
