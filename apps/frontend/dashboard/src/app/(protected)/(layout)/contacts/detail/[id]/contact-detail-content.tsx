"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ContactHeader } from "./components/contact-header";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";

interface ContactData {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: AudienceStatus;
	organizationId: string;
	properties?: Record<string, string | number>;
	groups?: { id: string; name: string }[];
	topics?: { id: string; name: string; subscription: "opt_in" | "opt_out" }[];
	suppressionReason: "hard_bounce" | "spam_complaint" | null;
	suppressedAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
}

interface Topic {
	id: string;
	name: string;
	defaultSubscription: "opt_in" | "opt_out";
}

export const ContactDetailContent = () => {
	const { id } = useParams();

	const {
		data: contactData,
		error: contactError,
		isLoading: contactLoading,
	} = useSWR<ContactData>(id ? `/api/contacts/retrieve/${id}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const { data: allPropertiesData } = useSWR<{
		properties: Property[];
		total: number;
	}>("/api/contacts/v1/properties/list?limit=100", {
		revalidateOnFocus: false,
	});

	// Fetch all topics for the organization
	const { data: allTopicsData } = useSWR<{
		topics: Topic[];
		total: number;
	}>("/api/contacts/v1/topics/list?limit=100", {
		revalidateOnFocus: false,
	});

	// Build all properties with their values (use fallbackValue if no explicit value, show "-" if neither)
	const allPropertiesWithValues =
		allPropertiesData?.properties?.map((prop) => {
			const val = contactData?.properties?.[prop.propertyName];
			return {
				id: prop.id,
				propertyId: prop.id,
				name: prop.propertyName,
				value:
					val !== undefined && val !== null
						? String(val)
						: prop.defaultValue || "-",
				createdAt: "",
				updatedAt: "",
			};
		}) || [];

	// Build enrolled topics array
	// Logic: A contact is enrolled in a topic if:
	// 1. Topic has defaultSubscription="opt_in" AND there's no explicit "unenrolled" record for this contact
	// 2. OR there's an explicit "enrolled" record for this contact
	const enrolledTopics = (() => {
		if (!allTopicsData?.topics) return [];

		// Build a map of topicId -> enrollment status from explicit enrollments
		const enrollmentMap = new Map<string, "opt_in" | "opt_out">();
		if (contactData?.topics) {
			for (const t of contactData.topics) {
				enrollmentMap.set(t.id, t.subscription);
			}
		}

		return allTopicsData.topics
			.filter((topic) => {
				const explicitStatus = enrollmentMap.get(topic.id);

				// If there's an explicit enrollment record
				if (explicitStatus) {
					return explicitStatus === "opt_in";
				}

				// No explicit record - use topic's defaultSubscription setting
				return topic.defaultSubscription === "opt_in";
			})
			.map((topic) => ({ id: topic.id, name: topic.name }));
	})();

	const isLoading = contactLoading;

	if (contactError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<p>sd</p>
			</div>
		);
	}

	if (!contactData && !isLoading) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-gray-900">
						Contact not found
					</h2>
					<p className="text-gray-500">
						The contact you're looking for doesn't exist or has been deleted.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<ContactHeader
				contact={contactData}
				isLoading={isLoading}
				propertyValues={allPropertiesWithValues}
				enrolledTopics={enrolledTopics}
			/>
		</div>
	);
};
