"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ContactHeader } from "./components/contact-header";

interface ContactData {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface PropertyValue {
	id: string;
	propertyId: string;
	value: string;
	createdAt: string;
	updatedAt: string;
}

interface Property {
	id: string;
	name: string;
	type: string;
	fallbackValue: string | null;
}

interface Topic {
	id: string;
	name: string;
	autoEnroll: "enrolled" | "unenrolled";
}

interface TopicEnrollment {
	id: string;
	contactId: string;
	topicId: string;
	status: "enrolled" | "unenrolled";
}

const ContactDetailPage = () => {
	const { id } = useParams();

	const {
		data: contactData,
		error: contactError,
		isLoading: contactLoading,
	} = useSWR<ContactData>(id ? `/api/contacts/v1/contacts/get/${id}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const { data: propertiesData, isLoading: propertiesLoading } = useSWR<{
		propertyValues: PropertyValue[];
	}>(id ? `/api/contacts/v1/contacts/${id}/properties` : null, {
		revalidateOnFocus: false,
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

	// Fetch contact's topic enrollments
	const { data: enrollmentsData } = useSWR<{
		enrollments: TopicEnrollment[];
		total: number;
	}>(
		id ? `/api/contacts/v1/enrollments/list?contactId=${id}&limit=100` : null,
		{
			revalidateOnFocus: false,
		},
	);

	// Build a map of propertyId -> property value for this contact
	const valueMap = new Map<string, string>();
	if (propertiesData?.propertyValues) {
		for (const pv of propertiesData.propertyValues) {
			valueMap.set(pv.propertyId, pv.value);
		}
	}

	// Build all properties with their values (use fallbackValue if no explicit value, show "-" if neither)
	const allPropertiesWithValues =
		allPropertiesData?.properties?.map((prop) => ({
			id: prop.id,
			propertyId: prop.id,
			name: prop.name,
			value: valueMap.get(prop.id) || prop.fallbackValue || "-",
			createdAt: "",
			updatedAt: "",
		})) || [];

	// Build enrolled topics array
	// Logic: A contact is enrolled in a topic if:
	// 1. Topic has autoEnroll="enrolled" AND there's no explicit "unenrolled" record for this contact
	// 2. OR there's an explicit "enrolled" record for this contact
	const enrolledTopics = (() => {
		if (!allTopicsData?.topics) return [];

		// Build a map of topicId -> enrollment status from explicit enrollments
		const enrollmentMap = new Map<string, "enrolled" | "unenrolled">();
		if (enrollmentsData?.enrollments) {
			for (const e of enrollmentsData.enrollments) {
				enrollmentMap.set(e.topicId, e.status);
			}
		}

		return allTopicsData.topics
			.filter((topic) => {
				const explicitStatus = enrollmentMap.get(topic.id);

				// If there's an explicit enrollment record
				if (explicitStatus) {
					return explicitStatus === "enrolled";
				}

				// No explicit record - use topic's autoEnroll setting
				return topic.autoEnroll === "enrolled";
			})
			.map((topic) => ({ id: topic.id, name: topic.name }));
	})();

	const isLoading = contactLoading || propertiesLoading;

	if (contactError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<SomethingWentWrong />
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

export default ContactDetailPage;
