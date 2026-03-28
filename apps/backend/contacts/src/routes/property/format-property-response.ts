import type { PropertyTypes } from "@be/contacts/types/property.type";

export function formatPropertyResponse(
  property: PropertyTypes.PropertyData,
): PropertyTypes.PropertyResponse {
  return {
    object: "contact_property" as const,
    id: property.id,
    name: property.propertyName,
    type: property.propertyType,
    fallbackValue: property.defaultValue,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}
