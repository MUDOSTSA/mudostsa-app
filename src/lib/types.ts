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
