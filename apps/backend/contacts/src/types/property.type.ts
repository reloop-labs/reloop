import type { PropertyModel } from "@be/contacts/model/property.model";

export namespace PropertyTypes {
  // Property Types
  export type PropertyResponse = typeof PropertyModel.propertyResponse.static;
  export type PropertyListResponse = typeof PropertyModel.propertyListResponse.static;
  export type CreatePropertyBody = typeof PropertyModel.createPropertyBody.static;
  export type UpdatePropertyBody = typeof PropertyModel.updatePropertyBody.static;
  export type PropertyQuery = typeof PropertyModel.propertyQuery.static;

  // Error Types
  export type PropertyNotFound = typeof PropertyModel.propertyNotFound.static;
  export type PropertyAlreadyExists = typeof PropertyModel.propertyAlreadyExists.static;
  export type Unauthorized = typeof PropertyModel.unauthorized.static;
  export type ValidationError = typeof PropertyModel.validationError.static;

  // Internal Data Types
  export interface PropertyData {
    id: string;
    name: string;
    type: string;
    fallbackValue: string | null;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface CreatePropertyRequest {
    name: string;
    type: "string" | "number";
    fallbackValue?: string;
  }

  export interface UpdatePropertyRequest {
    name?: string;
    type?: "string" | "number";
    fallbackValue?: string;
  }

  export interface PropertyListQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: "string" | "number";
    organizationId?: string;
  }
}
