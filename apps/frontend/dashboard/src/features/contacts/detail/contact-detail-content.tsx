import {
	useAllPropertiesQuery,
	useChannelsQuery,
	useContactQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import { ContactHeader } from "./contact-header";

export function ContactDetailContent({ contactId }: { contactId: string }) {
	const {
		data: contactData,
		error: contactError,
		isPending: contactLoading,
		isFetching,
	} = useContactQuery(contactId);

	const { data: allPropertiesData } = useAllPropertiesQuery();
	const { data: channelsData } = useChannelsQuery();

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

	const enrolledChannels = (() => {
		// Only show channels with an explicit enrollment on the contact.
		// Channel defaultSubscription (opt-in/opt-out) is not membership.
		const descriptions = new Map(
			(channelsData?.channels ?? []).map((c) => [c.id, c.description]),
		);
		return (contactData?.channels ?? [])
			.filter((channel) => channel.subscription === "opt_in")
			.map((channel) => ({
				id: channel.id,
				name: channel.name,
				description: descriptions.get(channel.id) ?? null,
			}));
	})();

	const isLoading = contactLoading || (isFetching && !contactData);

	if (contactError && !contactData) {
		const is404 =
			contactError instanceof Error && contactError.message.includes("404");
		return (
			<div className="py-12 text-center">
				<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
					{is404 ? "Contact not found" : "Failed to load contact"}
				</h2>
				<p className="text-text-sub-600">
					{is404
						? "The contact you're looking for doesn't exist or has been deleted."
						: "There was an error loading the contact details. Please try again."}
				</p>
			</div>
		);
	}

	if (!contactData && !isLoading) {
		return (
			<div className="py-12 text-center">
				<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
					Contact not found
				</h2>
				<p className="text-text-sub-600">
					The contact you&apos;re looking for doesn&apos;t exist or has been
					deleted.
				</p>
			</div>
		);
	}

	return (
		<ContactHeader
			contact={contactData}
			isLoading={isLoading}
			propertyValues={allPropertiesWithValues}
			enrolledChannels={enrolledChannels}
		/>
	);
}
