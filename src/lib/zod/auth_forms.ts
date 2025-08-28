import { z } from "zod";
import type { UserPosition } from "../enums";

export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  position: z.custom<UserPosition>(),
  positionTitle: z.string().min(1, "Position title is required"),
});

export type SignUpForm = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type SignInForm = z.infer<typeof signInSchema>;
