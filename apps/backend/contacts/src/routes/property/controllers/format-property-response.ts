import type { PropertyTypes } from "@be/contacts/types/property.type";

export function formatPropertyResponse(
  property: PropertyTypes.PropertyData,
): PropertyTypes.PropertyResponse {
  return {
    id: property.id,
    name: property.name,
    type: property.type,
    fallbackValue: property.fallbackValue,
    organizationId: property.organizationId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    deletedAt: property.deletedAt,
  };
}
