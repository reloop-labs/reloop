import { redirect } from "next/navigation";

export default async function AcceptInvitationCompatibilityPage({
	searchParams,
}: {
	searchParams: Promise<{ id?: string | string[] }>;
}) {
	const { id: rawId } = await searchParams;
	const id = Array.isArray(rawId) ? rawId[0] : rawId;
	const suffix = id ? `?id=${encodeURIComponent(id)}` : "";
	redirect(`/invite${suffix}`);
}
