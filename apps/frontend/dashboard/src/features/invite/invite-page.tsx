import { getRouteApi, Link } from "@tanstack/react-router";

const inviteRouteApi = getRouteApi("/invite");

/** Stub until organization invite acceptance is ported. */
export function InvitePage() {
	const { id } = inviteRouteApi.useSearch();

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6">
			<h1 className="font-medium text-label-lg text-text-strong-950">
				Accept invitation
			</h1>
			<p className="max-w-sm text-center text-[13px] text-text-sub-600">
				Invite acceptance will live here
				{id ? (
					<>
						{" "}
						(invite id:{" "}
						<span className="font-medium text-text-strong-950">{id}</span>)
					</>
				) : null}
				.
			</p>
			<Link
				to="/"
				className="text-[13px] font-medium text-text-strong-950 underline"
			>
				Back to dashboard
			</Link>
		</main>
	);
}
