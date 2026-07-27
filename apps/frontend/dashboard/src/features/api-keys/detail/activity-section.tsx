import { LogList } from "#/features/logs/log-list";

/** Request activity for a single API key (filtered by actor_id). */
export function ActivitySection({ actorId }: { actorId?: string }) {
	if (!actorId) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
				<p className="font-medium text-sm text-text-sub-600">
					Activity will appear here once the key is loaded.
				</p>
			</div>
		);
	}
	return <LogList actorId={actorId} hideDocs />;
}
