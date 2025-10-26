import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";

export function formatAudienceResponse(
    audience: AudienceTypes.AudienceData & { audienceGroup: { name: string } },
): AudienceTypes.AudienceResponse {
    return {
        id: audience.id,
        email: audience.email,
        firstName: audience.firstName,
        lastName: audience.lastName,
        organizationId: audience.organizationId,
        status: audience.status,
        audienceGroupId: audience.audienceGroupId,
        audienceGroupName: audience.audienceGroup.name,
        addedAt: audience.addedAt.toISOString(),
        unsubscribedAt: audience.unsubscribedAt?.toISOString() || null,
        createdAt: audience.createdAt.toISOString(),
        updatedAt: audience.updatedAt.toISOString(),
    };
}
