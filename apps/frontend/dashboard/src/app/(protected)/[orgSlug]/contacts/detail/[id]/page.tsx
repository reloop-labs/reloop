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
			/>
		</div>
	);
};

export default ContactDetailPage;
