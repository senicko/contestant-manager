import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/),
});

export const userCredentailsSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;
/** SerializedUser is a User without any sensitive data.  */
export type SerializedUser = Omit<User, "password">;
export type UserCredentials = z.infer<typeof userCredentailsSchema>;

/** Removes all of sensitive data from user. */
export const serializeUser = ({ password, ...secure }: User): SerializedUser =>
  secure;
