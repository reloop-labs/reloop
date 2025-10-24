import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";

export function formatAudienceGroupResponse(
    group: AudienceTypes.AudienceGroupData,
): AudienceTypes.AudienceGroupResponse {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        organizationId: group.organizationId,
        userId: group.userId,
        audienceCount: group.audienceCount || 0,
        subscribedCount: group.subscribedCount || 0,
        unsubscribedCount: group.unsubscribedCount || 0,
        deletedAt: group.deletedAt?.toISOString() || null,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
    };
}
