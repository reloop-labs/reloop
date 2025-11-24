import type { AudienceGroupTypes } from "@be/audience/types/audience-group.type";

export function formatAudienceGroupResponse(
	group: AudienceGroupTypes.AudienceGroupData,
): AudienceGroupTypes.AudienceGroupResponse {
	return {
		id: group.id,
		name: group.name,
		description: group.description,
		organizationId: group.organizationId,
		userId: group.userId,
		audienceCount: Number(group.audienceCount) || 0,
		subscribedCount: Number(group.subscribedCount) || 0,
		unsubscribedCount: Number(group.unsubscribedCount) || 0,
		deletedAt: group.deletedAt?.toISOString() || null,
		createdAt: group.createdAt.toISOString(),
		updatedAt: group.updatedAt.toISOString(),
	};
}
