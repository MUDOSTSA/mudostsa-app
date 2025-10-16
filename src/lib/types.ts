export type Link = {
  name: string;
  href: string;
  scope: number;
  icon: string;
};

export type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  position: string;
  avatar?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  membership: boolean;
};

export type InventoryItem = {
  id: number;
  created_at: Date;
  name: string;
  description: string;
  quantity: number;
  location: string;
  added_by: Profile;
  last_modified_by: Profile;
  category: string;
  updated_at: Date;
};
export type RoomTambayanSchedule = {
  id: number;
  created_at: Date;
  room: string;
  campus: string;
  time_start: Date;
  time_end: Date;
};

export type InventoryItemWithSelectedQuantity = {
  id: number;
  created_at: Date;
  name: string;
  description: string;
  quantity: number;
  location: string;
  added_by: Profile;
  last_modified_by: Profile;
  category: string;
  updated_at: Date;
  selectedQuantity: number;
};
export type SelectableInventoryItem = {
  item: InventoryItem;
  selected: boolean;
};

export type MembershipInfo = {
  id: string;
  position: string;
  name: string;
  active: boolean;
};
export type BasicAttendanceSheet = {
  id: number;
  created_at: Date;
  name: string;
  event_title: string | null | undefined;
  count: number;
  locked: boolean;
  private: boolean;
};
export type Event = {
  id: number;
  created_at: Date;
  event_title: string;
  event_head: Profile;
  event_description: string;
};
export type AttendanceSheet = {
  id: number;
  created_at: Date;
  name: string;
  for_event?: Event | null | undefined;
  member_records: MemberAttendanceRecord[];
  non_member_records: NonMemberAttendanceRecord[];
  locked: boolean;
  private: boolean;
  code: string | null;
};
export type MemberAttendanceRecord = {
  id: number;
  created_at: Date;
  member: Member;
};
export type NonMemberAttendanceRecord = {
  id: number;
  created_at: Date;
  name: string;
  program: string;
  year: number;
  student_number: string;
};
export type Member = {
  id: string;
  profile?: Profile | null | undefined;
  role: string;
  name: string;
  program: string;
  year: number;
  committee: string;
};

export type AttendanceRecordAdapter = {
  id: string;
  created_at: Date;
  name: string;
  program: string;
  year: number;
  committee: string;
  role: string;
  student_number: string;
  is_member: boolean;
};

export function normalizeAttendanceRecord(
  record: MemberAttendanceRecord | NonMemberAttendanceRecord
): AttendanceRecordAdapter {
  if ("member" in record) {
    // It's a MemberAttendanceRecord
    return {
      id: `m-${record.id}`,
      created_at: record.created_at,
      name: record.member.name,
      program: record.member.program,
      year: record.member.year,
      committee: record.member.committee,
      role: record.member.role,
      student_number: record.member.id,
      is_member: true,
    };
  } else {
    // It's a NonMemberAttendanceRecord
    return {
      id: `g-${record.id}`,
      created_at: record.created_at,
      name: record.name,
      program: record.program,
      year: record.year,
      committee: "",
      role: "",
      student_number: record.student_number,
      is_member: false,
    };
  }
}
