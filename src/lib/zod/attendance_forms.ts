import { z } from "zod";

// Schema for logging member attendance
export const logMemberAttendanceSchema = z.object({
  id: z.string().min(1, "Member ID is required").trim(),
});

// Schema for logging non-member attendance
export const logNonMemberAttendanceSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  program: z.string().min(1, "Program is required").trim(),
  year: z
    .number()
    .int()
    .min(1, "Year must be a positive number")
    .max(10, "Invalid year"),
  student_number: z.string().min(1, "Student number is required").trim(),
});

// Combined schema with discriminated union
export const logAttendanceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("member"),
    data: logMemberAttendanceSchema,
  }),
  z.object({
    type: z.literal("non-member"),
    data: logNonMemberAttendanceSchema,
  }),
]);

// Type exports for use in components
export type LogMemberAttendance = z.infer<typeof logMemberAttendanceSchema>;
export type LogNonMemberAttendance = z.infer<
  typeof logNonMemberAttendanceSchema
>;
export type LogAttendance = z.infer<typeof logAttendanceSchema>;
