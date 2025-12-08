import type { AudienceTopicModel } from "@be/audience/model/audience-topic.model";

export namespace AudienceTopicTypes {
  // Response Types
  export type AudienceTopicResponse = typeof AudienceTopicModel.audienceTopicResponse.static;
  export type AudienceTopicListResponse = typeof AudienceTopicModel.audienceTopicListResponse.static;

  // Request Types
  export type CreateAudienceTopicBody = typeof AudienceTopicModel.createAudienceTopicBody.static;
  export type UpdateAudienceTopicBody = typeof AudienceTopicModel.updateAudienceTopicBody.static;
  export type AudienceTopicQuery = typeof AudienceTopicModel.audienceTopicQuery.static;

  // Error Types
  export type AudienceTopicNotFound = typeof AudienceTopicModel.audienceTopicNotFound.static;
  export type AudienceTopicAlreadyExists = typeof AudienceTopicModel.audienceTopicAlreadyExists.static;
  export type Unauthorized = typeof AudienceTopicModel.unauthorized.static;
  export type ValidationError = typeof AudienceTopicModel.validationError.static;

  // Internal Data Types
  export interface AudienceTopicData {
    id: string;
    name: string;
    description: string | null;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface CreateAudienceTopicRequest {
    name: string;
    description?: string;
  }

  export interface UpdateAudienceTopicRequest {
    name?: string;
    description?: string;
  }

  export interface AudienceTopicListQuery {
    page?: number;
    limit?: number;
    search?: string;
  }
}
