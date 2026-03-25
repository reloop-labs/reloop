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

  export interface GroupResponse extends Omit<Group, "organizationId" | "userId" | "deletedAt"> {
    object: "contact_group";
  }

  export interface GroupListItem extends Omit<GroupResponse, "object"> { }

  export interface GroupListResponse {
    object: "contact_group";
    groups: GroupListItem[];
    total: number;
    page: number;
    limit: number;
  }
}
