import type { TopicModel } from "@be/contacts/model/topic.model";

export namespace TopicTypes {
	// Response Types
	export type TopicResponse = typeof TopicModel.topicResponse.static;
	export type TopicListResponse = typeof TopicModel.topicListResponse.static;

	// Request Types
	export type CreateTopicBody = typeof TopicModel.createTopicBody.static;
	export type UpdateTopicBody = typeof TopicModel.updateTopicBody.static;
	export type TopicQuery = typeof TopicModel.topicQuery.static;

	// Error Types
	export type TopicNotFound = typeof TopicModel.topicNotFound.static;
	export type TopicAlreadyExists = typeof TopicModel.topicAlreadyExists.static;
	export type Unauthorized = typeof TopicModel.unauthorized.static;
	export type ValidationError = typeof TopicModel.validationError.static;

	// Internal Data Types
	export interface TopicData {
		id: string;
		name: string;
		description: string | null;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
	}

	export interface CreateTopicRequest {
		name: string;
		description?: string;
	}

	export interface UpdateTopicRequest {
		name?: string;
		description?: string;
	}

	export interface TopicListQuery {
		page?: number;
		limit?: number;
		search?: string;
	}
}
