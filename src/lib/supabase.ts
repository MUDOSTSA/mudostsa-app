import {
  createClient,
  type SupabaseClient,
  type AuthChangeEvent,
  type Session,
  type PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { InventoryItem } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// --- AUTH ---
export const signUp = async (
  email: string,
  password: string,
  metadata?: Record<string, any>
) => {
  return supabase.auth.signUp({
    email,
    password,
    options: metadata ? { data: metadata } : undefined,
  });
};

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getSession = async () => {
  return supabase.auth.getSession();
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

// --- CRUD (Generic)
export const createRow = async (table: string, values: Record<string, any>) => {
  return supabase.from(table).insert(values).select();
};

export const readRows = async (
  table: string,
  query: Record<string, any> = {}
) => {
  return supabase.from(table).select("*").match(query);
};

export const readInventory: () => Promise<
  PostgrestSingleResponse<InventoryItem[]>
> = async () => {
  return supabase
    .from("inventory")
    .select(
      `*,
    last_modified_by (*),
    added_by (*)`
    )
    .order("updated_at", { ascending: false });
};

export const updateRow = async (
  table: string,
  id: number | string,
  values: Record<string, any>
) => {
  return supabase.from(table).update(values).eq("id", id).select();
};

export const deleteRow = async (table: string, id: number | string) => {
  return supabase.from(table).delete().eq("id", id);
};

// --- STORAGE ---
export const uploadFile = async (bucket: string, path: string, file: File) => {
  return supabase.storage.from(bucket).upload(path, file);
};

export const downloadFile = async (bucket: string, path: string) => {
  return supabase.storage.from(bucket).download(path);
};

export const listFiles = async (bucket: string, path: string = "") => {
  return supabase.storage.from(bucket).list(path);
};

export const deleteFile = async (bucket: string, path: string) => {
  return supabase.storage.from(bucket).remove([path]);
};
