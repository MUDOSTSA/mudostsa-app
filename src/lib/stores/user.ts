import { writable, derived } from "svelte/store";
import { supabase } from "../supabase";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Profile } from "$lib/types";

// Define the profile type based on your database schema
// Auth user store
export const authUser = writable<User | null>(null);

// Profile data store
export const userProfile = writable<Profile | null>(null);

// Loading states
export const isLoadingAuth = writable<boolean>(true);
export const isLoadingProfile = writable<boolean>(false);

// Error store
export const userError = writable<string | null>(null);

// Derived store for full user info
export const currentUser = derived(
  [authUser, userProfile],
  ([$authUser, $userProfile]) => ({
    auth: $authUser,
    profile: $userProfile,
    isAuthenticated: !!$authUser,
    hasProfile: !!$userProfile,
  })
);

// Initialize auth state and set up listener
export const initializeAuth = async () => {
  try {
    isLoadingAuth.set(true);
    userError.set(null);

    // Get initial session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
      userError.set(error.message);
      authUser.set(null);
      userProfile.set(null);
      return;
    }

    authUser.set(user);

    // Fetch profile if user exists
    if (user) {
      await fetchUserProfile(user.id);
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event);

        if (session?.user) {
          authUser.set(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          authUser.set(null);
          userProfile.set(null);
        }
      }
    );
  } catch (error) {
    console.error("Error initializing auth:", error);
    userError.set(error instanceof Error ? error.message : "Unknown error");
  } finally {
    isLoadingAuth.set(false);
  }
};

// Fetch user profile from profiles table
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Fetching profile for user ID:", userId);
    isLoadingProfile.set(true);
    userError.set(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*,memberships(active)")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      userError.set(error.message);
      userProfile.set(null);
      return null;
    }
    let modifiedData = { membership: data.memberships[0].active, ...data };
    userProfile.set(modifiedData);
    return modifiedData;
  } catch (error) {
    console.error("Error fetching profile:", error);
    userError.set(error instanceof Error ? error.message : "Unknown error");
    userProfile.set(null);
    return null;
  } finally {
    isLoadingProfile.set(false);
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<Profile>) => {
  try {
    isLoadingProfile.set(true);
    userError.set(null);

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", updates.user_id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      userError.set(error.message);
      return false;
    }

    userProfile.set(data);
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    userError.set(error instanceof Error ? error.message : "Unknown error");
    return false;
  } finally {
    isLoadingProfile.set(false);
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      userError.set(error.message);
      return false;
    }

    // Clear stores
    authUser.set(null);
    userProfile.set(null);
    userError.set(null);

    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    userError.set(error instanceof Error ? error.message : "Unknown error");
    return false;
  }
};

// Helper functions for easy access
export const getUserProfile = () => {
  let profile: Profile | null = null;
  userProfile.subscribe((value) => (profile = value))();
  return profile;
};

export const getAuthUser = () => {
  let user: User | null = null;
  authUser.subscribe((value) => (user = value))();
  return user;
};
