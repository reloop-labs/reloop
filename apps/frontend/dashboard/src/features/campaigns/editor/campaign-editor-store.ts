import { create } from "zustand";
import type { AudienceTargetType, Campaign } from "../campaign-types";

export interface CampaignEditorState {
	campaignId: string;
	name: string;
	subject: string;
	previewText: string;
	fromName: string;
	fromEmail: string;
	replyTo: string;
	audienceType: AudienceTargetType;
	audienceTargetId: string;
	audienceTargetName: string;

	// Editor UI state
	isSaving: boolean;
	lastSaved: Date | null;
	hasUnsavedChanges: boolean;
	previewDevice: "desktop" | "mobile";
	viewMode: "visual" | "code" | "preview";
	isDetailsOpen: boolean;

	// Actions
	setCampaignData: (campaign: Campaign) => void;
	setName: (name: string) => void;
	setSubject: (subject: string) => void;
	setPreviewText: (previewText: string) => void;
	setFromName: (fromName: string) => void;
	setFromEmail: (fromEmail: string) => void;
	setReplyTo: (replyTo: string) => void;
	setAudience: (
		type: AudienceTargetType,
		targetId?: string,
		targetName?: string,
	) => void;
	setIsSaving: (isSaving: boolean) => void;
	setLastSaved: (date: Date | null) => void;
	setHasUnsavedChanges: (hasUnsaved: boolean) => void;
	setPreviewDevice: (device: "desktop" | "mobile") => void;
	setViewMode: (mode: "visual" | "code" | "preview") => void;
	setIsDetailsOpen: (open: boolean) => void;
	toggleDetailsOpen: () => void;
}

export const useCampaignEditorStore = create<CampaignEditorState>((set) => ({
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

	setCampaignData: (campaign: Campaign) =>
		set({
			campaignId: campaign.id,
			name: campaign.name,
			subject: campaign.subject || "",
			previewText: campaign.previewText || "",
			fromName: campaign.fromName || "",
			fromEmail: campaign.fromEmail || "",
			replyTo: campaign.replyTo || "",
			audienceType: campaign.audienceType || "all",
			audienceTargetId: campaign.audienceTargetId || "",
			audienceTargetName: campaign.audienceTargetName || "All Contacts",
			hasUnsavedChanges: false,
		}),

	setName: (name) => set({ name, hasUnsavedChanges: true }),
	setSubject: (subject) => set({ subject, hasUnsavedChanges: true }),
	setPreviewText: (previewText) =>
		set({ previewText, hasUnsavedChanges: true }),
	setFromName: (fromName) => set({ fromName, hasUnsavedChanges: true }),
	setFromEmail: (fromEmail) => set({ fromEmail, hasUnsavedChanges: true }),
	setReplyTo: (replyTo) => set({ replyTo, hasUnsavedChanges: true }),
	setAudience: (type, targetId = "", targetName = "All Contacts") =>
		set({
			audienceType: type,
			audienceTargetId: targetId,
			audienceTargetName: targetName,
			hasUnsavedChanges: true,
		}),

	setIsSaving: (isSaving) => set({ isSaving }),
	setLastSaved: (date) => set({ lastSaved: date, hasUnsavedChanges: false }),
	setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
	setPreviewDevice: (previewDevice) => set({ previewDevice }),
	setViewMode: (viewMode) => set({ viewMode }),
	setIsDetailsOpen: (isDetailsOpen) => set({ isDetailsOpen }),
	toggleDetailsOpen: () =>
		set((state) => ({ isDetailsOpen: !state.isDetailsOpen })),
}));
