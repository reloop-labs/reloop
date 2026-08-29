"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type {
	Campaign,
	CampaignStats,
	CreateCampaignInput,
} from "./campaign-types";

interface CampaignsContextValue {
	campaigns: Campaign[];
	isLoading: boolean;
	isHydrated: boolean;
	stats: CampaignStats;
	getCampaign: (id: string) => Campaign | undefined;
	createCampaign: (input: CreateCampaignInput, recipientCount: number) => Promise<Campaign>;
	sendCampaign: (id: string) => Promise<void>;
	scheduleCampaign: (id: string, scheduledAt: string) => Promise<void>;
	duplicateCampaign: (id: string) => Promise<Campaign>;
	deleteCampaign: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

const STORAGE_KEY_PREFIX = "reloop_campaigns_";

function generateSampleCampaigns(orgId: string): Campaign[] {
	const now = Date.now();
	return [
		{
			id: "cmp_product_update_2026",
			organizationId: orgId,
			name: "August 2026 Product Release Notes",
			subject: "🚀 What's new in Reloop: AI Workflows, Better Deliverability & More",
			previewText: "Check out our latest speed improvements and real-time email logs.",
			fromName: "Pranav from Reloop",
			fromEmail: "updates@reloop.sh",
			replyTo: "support@reloop.sh",
			status: "sent",
			audienceType: "all",
			audienceTargetName: "All Contacts",
			recipientCount: 1420,
			sentCount: 1420,
			deliveredCount: 1408,
			openedCount: 892,
			clickedCount: 421,
			failedCount: 12,
			contentHtml: `<h2>Hey {{firstName | default: "there"}},</h2><p>We've shipped some incredible new features this month to make your email delivery even faster and more reliable.</p><p>Key highlights include:</p><ul><li>Instant webhook dispatch with sub-10ms latency</li><li>Redesigned contact management and segmentation</li><li>Integrated campaign broadcaster</li></ul><p>Thanks for being with us on this journey!</p><p>— The Reloop Team</p>`,
			sentAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
			createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
			updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
		},
		{
			id: "cmp_welcome_broadcast_2026",
			organizationId: orgId,
			name: "Community Newsletter #14",
			subject: "Tips for 99.9% email inbox placement in 2026",
			previewText: "Avoid the spam folder with DMARC, DKIM, and warming strategies.",
			fromName: "Reloop Growth",
			fromEmail: "newsletter@reloop.sh",
			replyTo: "help@reloop.sh",
			status: "sent",
			audienceType: "all",
			audienceTargetName: "All Contacts",
			recipientCount: 980,
			sentCount: 980,
			deliveredCount: 975,
			openedCount: 642,
			clickedCount: 298,
			failedCount: 5,
			contentHtml: `<h2>Mastering Modern Email Deliverability</h2><p>Hi {{firstName | default: "there"}},</p><p>As email providers tighten spam rules, maintaining top reputation is paramount. In this edition, we break down top authentication fixes and warming benchmarks.</p><p>Read the full guide on our docs.</p>`,
			sentAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
			createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
			updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
		},
		{
			id: "cmp_spring_webinar",
			organizationId: orgId,
			name: "Live Masterclass: Scaling Transactional & Broadcast Mail",
			subject: "Join our live developer session this Thursday",
			previewText: "Live Q&A with our infrastructure engineering team.",
			fromName: "Events at Reloop",
			fromEmail: "events@reloop.sh",
			status: "draft",
			audienceType: "all",
			audienceTargetName: "All Contacts",
			recipientCount: 0,
			sentCount: 0,
			deliveredCount: 0,
			openedCount: 0,
			clickedCount: 0,
			failedCount: 0,
			contentHtml: `<h2>You're invited to our next Tech Talk!</h2><p>Reserve your spot to learn how to scale your email infrastructure with automated retries and custom IP pools.</p>`,
			createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
			updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
		},
	];
}

export function CampaignsProvider({ children }: { children: ReactNode }) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const storageKey = `${STORAGE_KEY_PREFIX}${orgId}`;

	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Load campaigns from localStorage
	useEffect(() => {
		setIsLoading(true);
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed = JSON.parse(saved) as Campaign[];
				setCampaigns(parsed);
			} else {
				const initial = generateSampleCampaigns(orgId);
				setCampaigns(initial);
				localStorage.setItem(storageKey, JSON.stringify(initial));
			}
		} catch {
			const initial = generateSampleCampaigns(orgId);
			setCampaigns(initial);
		} finally {
			setIsHydrated(true);
			setIsLoading(false);
		}
	}, [storageKey, orgId]);

	// Save updates to localStorage
	const saveCampaigns = useCallback(
		(newCampaigns: Campaign[]) => {
			setCampaigns(newCampaigns);
			try {
				localStorage.setItem(storageKey, JSON.stringify(newCampaigns));
			} catch (e) {
				console.error("Failed to persist campaigns", e);
			}
		},
		[storageKey],
	);

	const stats = useMemo<CampaignStats>(() => {
		const sentCampaigns = campaigns.filter((c) => c.status === "sent");
		const totalCampaigns = campaigns.length;
		const totalDelivered = sentCampaigns.reduce((acc, c) => acc + c.deliveredCount, 0);
		const totalSent = sentCampaigns.reduce((acc, c) => acc + c.sentCount, 0);
		const totalOpened = sentCampaigns.reduce((acc, c) => acc + c.openedCount, 0);
		const totalClicked = sentCampaigns.reduce((acc, c) => acc + c.clickedCount, 0);

		const avgOpenRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
		const avgClickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0;

		return {
			totalCampaigns,
			totalDelivered,
			avgOpenRate,
			avgClickRate,
		};
	}, [campaigns]);

	const getCampaign = useCallback(
		(id: string) => campaigns.find((c) => c.id === id),
		[campaigns],
	);

	const createCampaign = useCallback(
		async (input: CreateCampaignInput, recipientCount: number): Promise<Campaign> => {
			const now = new Date().toISOString();
			const id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
			
			const isImmediate = input.sendImmediately;
			const isScheduled = !!input.scheduledAt && !isImmediate;

			const targetRecipients = recipientCount > 0 ? recipientCount : 1;
			const deliveredEstimate = isImmediate ? Math.max(1, Math.round(targetRecipients * 0.99)) : 0;

			const newCampaign: Campaign = {
				id,
				organizationId: orgId,
				name: input.name,
				subject: input.subject,
				previewText: input.previewText,
				fromName: input.fromName,
				fromEmail: input.fromEmail,
				replyTo: input.replyTo,
				status: isImmediate ? "sent" : isScheduled ? "scheduled" : "draft",
				audienceType: input.audienceType,
				audienceTargetId: input.audienceTargetId,
				audienceTargetName: input.audienceTargetName || "All Contacts",
				recipientCount: targetRecipients,
				sentCount: isImmediate ? targetRecipients : 0,
				deliveredCount: deliveredEstimate,
				openedCount: isImmediate ? 0 : 0,
				clickedCount: 0,
				failedCount: 0,
				templateId: input.templateId,
				templateName: input.templateName,
				contentHtml: input.contentHtml,
				scheduledAt: input.scheduledAt,
				sentAt: isImmediate ? now : undefined,
				createdAt: now,
				updatedAt: now,
			};

			const updated = [newCampaign, ...campaigns];
			saveCampaigns(updated);
			return newCampaign;
		},
		[campaigns, orgId, saveCampaigns],
	);

	const sendCampaign = useCallback(
		async (id: string) => {
			const existing = campaigns.find((c) => c.id === id);
			if (!existing) throw new Error("Campaign not found");

			const now = new Date().toISOString();
			const targetRecipients = existing.recipientCount > 0 ? existing.recipientCount : 1;
			const delivered = Math.max(1, Math.round(targetRecipients * 0.99));

			const updated = campaigns.map((c) =>
				c.id === id
					? {
							...c,
							status: "sent" as const,
							sentCount: targetRecipients,
							deliveredCount: delivered,
							sentAt: now,
							updatedAt: now,
						}
					: c,
			);

			saveCampaigns(updated);
			toast.success(`Campaign "${existing.name}" broadcasted successfully!`);
		},
		[campaigns, saveCampaigns],
	);

	const scheduleCampaign = useCallback(
		async (id: string, scheduledAt: string) => {
			const existing = campaigns.find((c) => c.id === id);
			if (!existing) throw new Error("Campaign not found");

			const now = new Date().toISOString();
			const updated = campaigns.map((c) =>
				c.id === id
					? {
							...c,
							status: "scheduled" as const,
							scheduledAt,
							updatedAt: now,
						}
					: c,
			);

			saveCampaigns(updated);
			toast.success(`Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`);
		},
		[campaigns, saveCampaigns],
	);

	const duplicateCampaign = useCallback(
		async (id: string): Promise<Campaign> => {
			const existing = campaigns.find((c) => c.id === id);
			if (!existing) throw new Error("Campaign not found");

			const now = new Date().toISOString();
			const cloned: Campaign = {
				...existing,
				id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
				name: `${existing.name} (Copy)`,
				status: "draft",
				sentCount: 0,
				deliveredCount: 0,
				openedCount: 0,
				clickedCount: 0,
				failedCount: 0,
				sentAt: undefined,
				scheduledAt: undefined,
				createdAt: now,
				updatedAt: now,
			};

			const updated = [cloned, ...campaigns];
			saveCampaigns(updated);
			toast.success(`Duplicated "${existing.name}"`);
			return cloned;
		},
		[campaigns, saveCampaigns],
	);

	const deleteCampaign = useCallback(
		async (id: string) => {
			const existing = campaigns.find((c) => c.id === id);
			const updated = campaigns.filter((c) => c.id !== id);
			saveCampaigns(updated);
			toast.success(existing ? `Deleted "${existing.name}"` : "Campaign deleted");
		},
		[campaigns, saveCampaigns],
	);

	const value = useMemo<CampaignsContextValue>(
		() => ({
			campaigns,
			isLoading,
			isHydrated,
			stats,
			getCampaign,
			createCampaign,
			sendCampaign,
			scheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		}),
		[
			campaigns,
			isLoading,
			isHydrated,
			stats,
			getCampaign,
			createCampaign,
			sendCampaign,
			scheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		],
	);

	return (
		<CampaignsContext.Provider value={value}>
			{children}
		</CampaignsContext.Provider>
	);
}

export function useCampaigns() {
	const context = useContext(CampaignsContext);
	if (!context) {
		throw new Error("useCampaigns must be used within a CampaignsProvider");
	}
	return context;
}
