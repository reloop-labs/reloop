import type { AudienceTypes } from "@be/audience/types/audience.type";

export function formatAudienceResponse(
	audience: AudienceTypes.AudienceData,
): AudienceTypes.AudienceResponse {
	return {
		id: audience.id,
		email: audience.email,
		firstName: audience.firstName,
		lastName: audience.lastName,
		organizationId: audience.organizationId,
		createdAt: audience.createdAt,
		updatedAt: audience.updatedAt,
		deletedAt: audience.deletedAt,
	};
}
