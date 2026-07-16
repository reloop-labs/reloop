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
	const { data: allChannelsData } = useChannelsQuery();

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
		if (!allChannelsData?.channels) return [];

		const subscriptionMap = new Map<string, "opt_in" | "opt_out">();
		if (contactData?.channels) {
			for (const t of contactData.channels) {
				subscriptionMap.set(t.id, t.subscription);
			}
		}

		return allChannelsData.channels
			.filter((channel) => {
				const explicitStatus = subscriptionMap.get(channel.id);
				if (explicitStatus) {
					return explicitStatus === "opt_in";
				}
				return channel.defaultSubscription === "opt_in";
			})
			.map((channel) => ({ id: channel.id, name: channel.name }));
	})();

	const isLoading = contactLoading || (isFetching && !contactData);

	if (contactError && !contactData) {
		return (
			<div className="py-12 text-center">
				<p className="text-sm text-text-sub-600">Failed to load contact</p>
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
