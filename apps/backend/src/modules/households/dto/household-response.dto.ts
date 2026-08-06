export class HouseholdMemberDto {
  id!: string;
  userId!: string;
  role!: string;
  joinedAt!: string;
}

export class HouseholdResponseDto {
  id!: string;
  workspaceId!: string;
  name!: string;
  members!: HouseholdMemberDto[];
  createdAt!: string;
  updatedAt!: string;
}
