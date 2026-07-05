import type { Metadata } from "next";
import { GroupDetailContent } from "./group-detail-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Group Detail · Reloop",
	description: "View and manage contact group details.",
};

export default function GroupDetailPage() {
	return <GroupDetailContent />;
}
