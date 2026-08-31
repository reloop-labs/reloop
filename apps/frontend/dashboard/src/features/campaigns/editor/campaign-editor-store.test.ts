import { beforeEach, describe, expect, it } from "bun:test";
import type { Campaign } from "../campaign-types";
import { useCampaignEditorStore } from "./campaign-editor-store";

describe("useCampaignEditorStore", () => {
	beforeEach(() => {
		useCampaignEditorStore.setState({
			campaignId: "",
			name: "",
			subject: "",
			previewText: "",
			fromName: "",
			fromEmail: "",
			replyTo: "",
			audienceType: "all",
			audienceTargetId: "",
			audienceTargetName: "All Contacts",
			isSaving: false,
			lastSaved: null,
			hasUnsavedChanges: false,
			previewDevice: "desktop",
			viewMode: "visual",
			isDetailsOpen: true,
		});
	});

	it("initializes from campaign data", () => {
		const mockCampaign: Campaign = {
			id: "cmp_123",
			organizationId: "org_1",
			name: "Summer Blast",
			subject: "Hot Deals Inside",
			previewText: "Don't miss out",
			fromName: "Store Team",
			fromEmail: "news@store.com",
			replyTo: "help@store.com",
			status: "draft",
			audienceType: "all",
			audienceTargetId: "",
			audienceTargetName: "All Contacts",
			recipientCount: 150,
			sentCount: 0,
			deliveredCount: 0,
			openedCount: 0,
			clickedCount: 0,
			failedCount: 0,
			contentHtml: "<p>Welcome</p>",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		useCampaignEditorStore.getState().setCampaignData(mockCampaign);

		const state = useCampaignEditorStore.getState();
		expect(state.campaignId).toBe("cmp_123");
		expect(state.name).toBe("Summer Blast");
		expect(state.subject).toBe("Hot Deals Inside");
		expect(state.previewText).toBe("Don't miss out");
		expect(state.fromName).toBe("Store Team");
		expect(state.fromEmail).toBe("news@store.com");
		expect(state.hasUnsavedChanges).toBe(false);
	});

	it("updates subject and flags unsaved changes", () => {
		useCampaignEditorStore.getState().setSubject("New Subject Line");
		const state = useCampaignEditorStore.getState();
		expect(state.subject).toBe("New Subject Line");
		expect(state.hasUnsavedChanges).toBe(true);
	});

	it("switches view modes and preview devices", () => {
		useCampaignEditorStore.getState().setViewMode("code");
		expect(useCampaignEditorStore.getState().viewMode).toBe("code");

		useCampaignEditorStore.getState().setPreviewDevice("mobile");
		expect(useCampaignEditorStore.getState().previewDevice).toBe("mobile");
	});
});
