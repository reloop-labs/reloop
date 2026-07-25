import { pageMetadata } from "#/app/_lib/page-metadata";
import { GroupDetailContent } from "./client";

export const metadata = pageMetadata(
	"Group Detail · Reloop",
	"View and manage contact group details.",
);

export default async function ContactGroupDetailRoute({
	params,
}: {
	params: Promise<{ groupId: string }>;
}) {
	const { groupId } = await params;
	return <GroupDetailContent groupId={groupId} />;
}
