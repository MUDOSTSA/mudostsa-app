import {
  createClient,
  type SupabaseClient,
  type AuthChangeEvent,
  type Session,
  type PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type {
  AttendanceSheet,
  BasicAttendanceSheet,
  InventoryItem,
  Member,
  RoomTambayanSchedule,
} from "./types";

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
export const readTambayanSchedules: () => Promise<
  PostgrestSingleResponse<RoomTambayanSchedule[]>
> = async () => {
  return supabase
    .from(`tambayan`)
    .select("*, attendance_sheet:attendance_sheets (*)");
};

export const readNavigationLinks = async () => {
  return supabase
    .from("navigation")
    .select("*")
    .order("position", { ascending: true });
};
export const readEventTitle: (
  slug: string
) => Promise<PostgrestSingleResponse<{ event_title: string }>> = async (
  slug
) => {
  return supabase.from("events").select("event_title").eq("id", slug).single();
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
export const readAttendanceSheets: () => Promise<
  PostgrestSingleResponse<BasicAttendanceSheet[]>
> = async () => {
  const result = await supabase
    .from("attendance_basic_view")
    .select("*")
    .order("created_at", { ascending: false });
  console.log(
    "readAttendanceSheets data:",
    result.data,
    "error:",
    result.error
  );
  return result;
};

export const readAttendanceSheet: (
  id: number
) => Promise<PostgrestSingleResponse<AttendanceSheet>> = async (id) => {
  return supabase
    .from("attendance_sheets")
    .select(
      `*,
    member_records:attendance_record (*, member:members (*)),
    non_member_records:non_member_attendance_record (*),
    for_event:events (*)
    `
    )
    .eq("id", id)
    .single();
};

export const readMember: (
  id: string
) => Promise<PostgrestSingleResponse<Member>> = async (id) => {
  return supabase
    .from("members")
    .select("*, profile:profiles (*)")
    .eq("id", id)
    .single();
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
