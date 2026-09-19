import type { Metadata } from "next";
import { DemoHover } from "./demo-hover-client";

export const metadata: Metadata = {
	title: "Hover border demo (internal)",
	robots: { index: false, follow: false },
};

export default function DemoHoverPage() {
	return <DemoHover />;
}
