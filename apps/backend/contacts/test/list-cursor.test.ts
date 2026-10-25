import { describe, expect, test } from "bun:test";
import { ChannelModel } from "@be/contacts/model/channel.model";
import { ContactModel } from "@be/contacts/model/contact.model";
import { GroupModel } from "@be/contacts/model/group.model";
import { PropertyModel } from "@be/contacts/model/property.model";
import type { TObject } from "elysia";

const lists: Array<[string, TObject, TObject]> = [
	["contacts", ContactModel.contactQuery, ContactModel.contactListResponse],
	[
		"group contacts",
		ContactModel.contactQuery,
		ContactModel.groupContactListResponse,
	],
	["groups", GroupModel.groupQuery, GroupModel.groupListResponse],
	["channels", ChannelModel.channelQuery, ChannelModel.channelListResponse],
	[
		"properties",
		PropertyModel.propertyQuery,
		PropertyModel.propertyListResponse,
	],
];

describe("cursor pagination models", () => {
	for (const [name, query, response] of lists) {
		test(`${name} list accepts cursor and returns hasMore/nextCursor`, () => {
			expect(query.properties.cursor).toBeDefined();
			expect(query.required ?? []).not.toContain("cursor");
			expect(query.properties.page).toBeDefined();
			expect(response.properties.hasMore).toBeDefined();
			expect(response.properties.nextCursor).toBeDefined();
			for (const field of ["total", "page", "limit"]) {
				expect(response.properties[field]).toBeDefined();
			}
		});
	}
});
