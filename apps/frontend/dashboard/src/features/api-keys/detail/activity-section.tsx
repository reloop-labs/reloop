import { LogList } from "#/features/logs/log-list";

/** Request activity for a single API key (filtered by actor_id). */
export function ActivitySection({ actorId }: { actorId?: string }) {
	if (!actorId) return null;
	return (
		<section className="mt-6">
			<LogList actorId={actorId} hideDocs />
		</section>
	);
}
