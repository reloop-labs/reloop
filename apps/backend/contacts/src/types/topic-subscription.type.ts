import type { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";

export namespace TopicSubscriptionTypes {
  // Response Types
  export type TopicSubscriptionResponse = typeof TopicSubscriptionModel.topicSubscriptionResponse.static;
  export type TopicSubscriptionListResponse = typeof TopicSubscriptionModel.topicSubscriptionListResponse.static;

  // Request Types
  export type CreateTopicSubscriptionBody = typeof TopicSubscriptionModel.createTopicSubscriptionBody.static;
  export type UpdateTopicSubscriptionBody = typeof TopicSubscriptionModel.updateTopicSubscriptionBody.static;
  export type TopicSubscriptionQuery = typeof TopicSubscriptionModel.topicSubscriptionQuery.static;

  // Error Types
  export type NotFound = typeof TopicSubscriptionModel.notFound.static;
  export type SubscriptionAlreadyExists = typeof TopicSubscriptionModel.subscriptionAlreadyExists.static;
  export type Unauthorized = typeof TopicSubscriptionModel.unauthorized.static;
  export type ValidationError = typeof TopicSubscriptionModel.validationError.static;

  // Internal Data Types
  export interface TopicSubscriptionData {
    id: string;
    contactId: string;
    topicId: string;
    organizationId: string;
    status: "subscribed" | "unsubscribed";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface CreateTopicSubscriptionRequest {
    contactId: string;
    topicId: string;
    status?: "subscribed" | "unsubscribed";
  }

  export interface UpdateTopicSubscriptionRequest {
    status: "subscribed" | "unsubscribed";
  }

  export interface TopicSubscriptionListQuery {
    page?: number;
    limit?: number;
    contactId?: string;
    topicId?: string;
    status?: "subscribed" | "unsubscribed";
  }
}
