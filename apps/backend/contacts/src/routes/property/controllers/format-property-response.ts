import type { PropertyTypes } from "@be/contacts/types/property.type";

export function formatPropertyResponse(
  property: PropertyTypes.PropertyData,
): PropertyTypes.PropertyResponse {
  return {
    id: property.id,
    name: property.propertyName,
    type: property.propertyType,
    fallbackValue: property.defaultValue,
    organizationId: property.organizationId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    deletedAt: property.deletedAt,
  };
}
