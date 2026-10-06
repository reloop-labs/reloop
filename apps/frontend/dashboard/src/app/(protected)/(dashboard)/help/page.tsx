import { pageMetadata } from "#/app/_lib/page-metadata";
import { HelpPage } from "./client";

export const metadata = pageMetadata(
	"Help · Reloop",
	"Chat with the founders and get help with Reloop.",
);

// Client chat (session/socket gates), not eligible for instant navigation.
export const instant = false;

export default function HelpRoute() {
	return <HelpPage />;
}
