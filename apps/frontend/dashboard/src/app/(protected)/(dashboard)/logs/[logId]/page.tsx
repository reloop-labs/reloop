import { pageMetadata } from "#/app/_lib/page-metadata";
import { LogDetailPage } from "./client";

export const metadata = pageMetadata(
	"Log · Reloop",
	"View full details for a single log entry.",
);

export default async function LogDetailRoute({
	params,
}: {
	params: Promise<{ logId: string }>;
}) {
	const { logId } = await params;
	return <LogDetailPage logId={logId} />;
}
