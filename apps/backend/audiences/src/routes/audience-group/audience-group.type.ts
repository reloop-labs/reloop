import type { AudienceGroupModel } from "@reloop/audience/routes/audience-group/audience-group.model";

export namespace AudienceGroupTypes {
    // Audience Group Types
    export type AudienceGroupResponse = typeof AudienceGroupModel.audienceGroupResponse.static;
    export type AudienceGroupListResponse = typeof AudienceGroupModel.audienceGroupListResponse.static;
    export type CreateAudienceGroupBody = typeof AudienceGroupModel.createAudienceGroupBody.static;
    export type UpdateAudienceGroupBody = typeof AudienceGroupModel.updateAudienceGroupBody.static;
    export type AudienceGroupQuery = typeof AudienceGroupModel.audienceGroupQuery.static;

    // Error Types
    export type AudienceGroupNotFound = typeof AudienceGroupModel.audienceGroupNotFound.static;
    export type Unauthorized = typeof AudienceGroupModel.unauthorized.static;
    export type ValidationError = typeof AudienceGroupModel.validationError.static;

    // Internal Data Types
    export interface AudienceGroupData {
        id: string;
        name: string;
        description: string | null;
        organizationId: string;
        userId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        audienceCount?: number;
        subscribedCount?: number;
        unsubscribedCount?: number;
    }

    export interface CreateAudienceGroupRequest {
        name: string;
        description?: string;
    }

    export interface UpdateAudienceGroupRequest {
        name?: string;
        description?: string;
    }

    export interface AudienceGroupListQuery {
        page?: number;
        limit?: number;
        search?: string;
        organizationId?: string;
        userId?: string;
    }
}
