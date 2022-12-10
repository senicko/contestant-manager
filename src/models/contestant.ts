import { z } from "zod";

export const contestantSchema = z.object({
  name: z.string().min(1).max(100),
  gender: z.enum(["male", "famale"]),
  birthDate: z.preprocess((value) => {
    if (typeof value === "string") return new Date(value);
  }, z.date()),
  skiLength: z.number().min(0.1),
});

export type Contestant = z.infer<typeof contestantSchema>;
