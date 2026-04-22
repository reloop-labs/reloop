import type { Metadata } from "next";
import { GroupDetailContent } from "./group-detail-content";

export const metadata: Metadata = {
	title: "Group Detail · Reloop",
	description: "View and manage contact group details.",
};

export default function GroupDetailPage() {
	return <GroupDetailContent />;
}
