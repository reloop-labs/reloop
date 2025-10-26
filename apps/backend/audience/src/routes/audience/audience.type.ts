import type { AudienceModel } from "@reloop/audience/routes/audience/audience.model";

export namespace AudienceTypes {
    // Audience Types
    export type AudienceResponse = typeof AudienceModel.audienceResponse.static;
    export type AudienceListResponse = typeof AudienceModel.audienceListResponse.static;
    export type CreateAudienceBody = typeof AudienceModel.createAudienceBody.static;
    export type UpdateAudienceBody = typeof AudienceModel.updateAudienceBody.static;
    export type AudienceQuery = typeof AudienceModel.audienceQuery.static;

    // Bulk Operations Types
    export type BulkImportAudiencesBody = typeof AudienceModel.bulkImportAudiencesBody.static;
    export type BulkImportResponse = typeof AudienceModel.bulkImportResponse.static;

    // Status Management Types
    export type SubscribeAudienceBody = typeof AudienceModel.subscribeAudienceBody.static;
    export type UnsubscribeAudienceBody = typeof AudienceModel.unsubscribeAudienceBody.static;

    // Search Types
    export type SearchAudiencesQuery = typeof AudienceModel.searchAudiencesQuery.static;

    // Error Types
    export type AudienceNotFound = typeof AudienceModel.audienceNotFound.static;
    export type AudienceAlreadyExists = typeof AudienceModel.audienceAlreadyExists.static;
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
        status: "subscribed" | "unsubscribed";
        audienceGroupId: string;
        addedAt: Date;
        unsubscribedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface CreateAudienceRequest {
        email: string;
        firstName?: string;
        lastName?: string;
        audienceGroupId: string;
        status?: "subscribed" | "unsubscribed";
    }

    export interface UpdateAudienceRequest {
        firstName?: string;
        lastName?: string;
        audienceGroupId?: string;
    }

    export interface BulkImportAudienceItem {
        email: string;
        firstName?: string;
        lastName?: string;
        status?: "subscribed" | "unsubscribed";
    }

    export interface BulkImportAudiencesRequest {
        audienceGroupId: string;
        audiences: BulkImportAudienceItem[];
    }

    export interface SubscribeAudienceRequest {
        reason?: string;
    }

    export interface UnsubscribeAudienceRequest {
        reason?: string;
    }

    export interface AudienceListQuery {
        page?: number;
        limit?: number;
        search?: string;
        status?: "subscribed" | "unsubscribed";
        audienceGroupId?: string;
        organizationId?: string;
        userId?: string;
    }

    export interface SearchAudiencesRequest {
        query: string;
        page?: number;
        limit?: number;
        status?: "subscribed" | "unsubscribed";
        audienceGroupId?: string;
        organizationId?: string;
    }

    export interface BulkImportError {
        email: string;
        error: string;
    }

    export interface BulkImportResult {
        successful: number;
        failed: number;
        errors: BulkImportError[];
    }
}
