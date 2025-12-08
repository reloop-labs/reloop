import type { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";

export namespace AudienceTopicMapperTypes {
  // Response Types
  export type AudienceTopicMapperResponse = typeof AudienceTopicMapperModel.audienceTopicMapperResponse.static;
  export type AudienceTopicMapperListResponse = typeof AudienceTopicMapperModel.audienceTopicMapperListResponse.static;

  // Request Types
  export type CreateAudienceTopicMapperBody = typeof AudienceTopicMapperModel.createAudienceTopicMapperBody.static;
  export type UpdateAudienceTopicMapperBody = typeof AudienceTopicMapperModel.updateAudienceTopicMapperBody.static;
  export type AudienceTopicMapperQuery = typeof AudienceTopicMapperModel.audienceTopicMapperQuery.static;

  // Error Types
  export type NotFound = typeof AudienceTopicMapperModel.notFound.static;
  export type MappingAlreadyExists = typeof AudienceTopicMapperModel.mappingAlreadyExists.static;
  export type Unauthorized = typeof AudienceTopicMapperModel.unauthorized.static;
  export type ValidationError = typeof AudienceTopicMapperModel.validationError.static;

  // Internal Data Types
  export interface AudienceTopicMapperData {
    id: string;
    audienceId: string;
    audienceTopicId: string;
    organizationId: string;
    status: "subscribed" | "unsubscribed";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface CreateAudienceTopicMapperRequest {
    audienceId: string;
    audienceTopicId: string;
    status?: "subscribed" | "unsubscribed";
  }

  export interface UpdateAudienceTopicMapperRequest {
    status: "subscribed" | "unsubscribed";
  }

  export interface AudienceTopicMapperListQuery {
    page?: number;
    limit?: number;
    audienceId?: string;
    audienceTopicId?: string;
    status?: "subscribed" | "unsubscribed";
  }
}
