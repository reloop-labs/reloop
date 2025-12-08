import type { AudienceModel } from "@be/audience/model/audience.model";

export namespace AudienceTypes {
	// Audience Types
	export type AudienceResponse = typeof AudienceModel.audienceResponse.static;
	export type AudienceListResponse =
		typeof AudienceModel.audienceListResponse.static;
	export type CreateAudienceBody =
		typeof AudienceModel.createAudienceBody.static;
	export type UpdateAudienceBody =
		typeof AudienceModel.updateAudienceBody.static;
	export type AudienceQuery = typeof AudienceModel.audienceQuery.static;

	// Search Types
	export type SearchAudiencesQuery =
		typeof AudienceModel.searchAudiencesQuery.static;

	// Error Types
	export type AudienceNotFound = typeof AudienceModel.audienceNotFound.static;
	export type AudienceAlreadyExists =
		typeof AudienceModel.audienceAlreadyExists.static;
	export type InvalidEmail = typeof AudienceModel.invalidEmail.static;
	export type Unauthorized = typeof AudienceModel.unauthorized.static;
	export type ValidationError = typeof AudienceModel.validationError.static;

	// Internal Data Types
	export interface AudienceData {
		id: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
	}

	export interface CreateAudienceRequest {
		email: string;
		firstName?: string;
		lastName?: string;
	}

	export interface UpdateAudienceRequest {
		firstName?: string;
		lastName?: string;
	}

	export interface AudienceListQuery {
		page?: number;
		limit?: number;
		search?: string;
		organizationId?: string;
	}

	export interface SearchAudiencesRequest {
		query: string;
		page?: number;
		limit?: number;
		organizationId?: string;
	}
}
