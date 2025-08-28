export type Link = {
  name: string;
  href: string;
  scope: number;
  icon: string;
};

export type Profile = {
  user_id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar: string;
  position: string;
  email: string;
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
