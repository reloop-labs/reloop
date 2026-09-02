export type CampaignStatus =
	| "draft"
	| "scheduled"
	| "sending"
	| "sent"
	| "cancelled";

export type AudienceTargetType = "all" | "channel" | "group" | "csv";

export type Campaign = {
	id: string;
	organizationId: string;
	name: string;
	subject: string;
	previewText?: string;
	fromName: string;
	fromEmail: string;
	replyTo?: string;
	status: CampaignStatus;
	audienceType: AudienceTargetType;
	audienceTargetId?: string;
	audienceTargetName?: string;
	recipientCount: number;
	sentCount: number;
	deliveredCount: number;
	openedCount: number;
	clickedCount: number;
	failedCount: number;
	templateId?: string;
	templateName?: string;
	content?: unknown[];
	contentHtml: string;
	scheduledAt?: string;
	sentAt?: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateCampaignInput = {
	name: string;
	subject: string;
	previewText?: string;
	fromName: string;
	fromEmail: string;
	replyTo?: string;
	audienceType: AudienceTargetType;
	audienceTargetId?: string;
	audienceTargetName?: string;
	templateId?: string;
	templateName?: string;
	content?: unknown[];
	contentHtml: string;
	csvEmails?: string[];
	scheduledAt?: string;
	sendImmediately?: boolean;
};

export type UpdateCampaignInput = {
	name?: string;
	subject?: string;
	previewText?: string;
	fromName?: string;
	fromEmail?: string;
	replyTo?: string;
	audienceType?: AudienceTargetType;
	audienceTargetId?: string;
	audienceTargetName?: string;
	templateId?: string;
	templateName?: string;
	content?: unknown[];
	contentHtml?: string;
	csvEmails?: string[];
};
