import { z } from "zod";

/**
 * TODO:
 * - Document usage within React Hook Form.
 * - Document usage within Formik.
 */

/**
 * Schema to validate a users password during a sign up flow.
 */
export const PasswordValidation = z
  .string()
  .min(8, { message: "Choose password that contains 8+ characters." })
  .regex(/[a-z]/, { message: "Password must contain one lowercase character." })
  .regex(/[A-Z]/, { message: "Password must contain one uppercase character." })
  .regex(/\d/, { message: "Password must contain one number character." })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must contain one special case character.",
  });

/**
 * Schema to validate a users South African cellphone number.
 */
export const SouthAfricanCellphoneSchema = z
  .string()
  .length(10, { message: "Cellphone number must be exactly 10 digits long." })
  .refine((data) => data.startsWith("0"), {
    message: "Cellphone number must start with '0'.",
  })
  .refine((data) => data[1] >= "1" && data[1] <= "9", {
    message: "The second digit must be between 1 and 9.",
  });

/**
 * Schema to validate a users email address and password formatting during a sign up flow.
 */
export const EmailSignupSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Email address is invalid.")
    .refine(
      (email) => email === email.toLowerCase(),
      "Email address must not contain uppercase characters."
    ),
  password: PasswordValidation,
});

/**
 * Schema to validate a user's cellphone number and password formatting during a sign up flow.
 */
export const CellphoneSignupSchema = z.object({
  cellphone: SouthAfricanCellphoneSchema,
  password: PasswordValidation, // Assuming PasswordValidation is defined similarly as in your previous example
});

/**
 * Schema to validate a users email address during a sign up flow.
 * Makes sure the user has input a value for password to check against.
 */
export const LoginSchema = z.object({
  emailAddress: z
    .string()
    .email("Email address is invalid.")
    .min(1, "Email address is required.")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

/**
 * Schema to validate a users reset password code along with their new password,
 * also check that the confirmPassword field matches the initial password.
 */
export const ResetPasswordSchema = z
  .object({
    resetCode: z.string().min(1, "Reset code is required."),
    password: z.string().min(1, "Password is required."), // Simplified password validation
    confirmPassword: z.string().min(1, "Confirm password is required."), // Also simplified
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This indicates where the error should be attached
  });
