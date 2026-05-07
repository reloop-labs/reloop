import type { ChannelModel } from "@be/contacts/model/channel.model";

export namespace ChannelTypes {
	// Response Types
	export type ChannelResponse = typeof ChannelModel.channelResponse.static;
	export type ChannelListResponse =
		typeof ChannelModel.channelListResponse.static;

	// Request Types
	export type CreateChannelBody = typeof ChannelModel.createChannelBody.static;
	export type UpdateChannelBody = typeof ChannelModel.updateChannelBody.static;
	export type ChannelQuery = typeof ChannelModel.channelQuery.static;

	// Error Types
	export type ChannelNotFound = typeof ChannelModel.channelNotFound.static;
	export type ChannelAlreadyExists =
		typeof ChannelModel.channelAlreadyExists.static;
	export type Unauthorized = typeof ChannelModel.unauthorized.static;
	export type ValidationError = typeof ChannelModel.validationError.static;

	// Internal Data Types
	export interface ChannelData {
		id: string;
		name: string;
		description: string | null;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
		subscriberCount?: number;
	}

	export interface CreateChannelRequest {
		name: string;
		description?: string;
	}

	export interface UpdateChannelRequest {
		name?: string;
		description?: string;
	}

	export interface ChannelListQuery {
		page?: number;
		limit?: number;
	}
}
