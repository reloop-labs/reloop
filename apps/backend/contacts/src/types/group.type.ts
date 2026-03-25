export namespace GroupTypes {
  export interface Group {
    id: string;
    name: string;
    organizationId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }

  export interface GroupResponse extends Group {
    object: "contact_group";
  }

  export interface GroupListResponse {
    object: "contact_group";
    groups: GroupResponse[];
    total: number;
    page: number;
    limit: number;
  }
}
