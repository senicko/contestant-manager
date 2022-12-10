import { z } from "zod";
import { Contestant } from "./contestant";

export const contestSchema = z.object({
  name: z.string().min(1),
});

export type Contest = z.infer<typeof contestSchema>;
export type PopulatedContest = Contest & { contestants: Contestant };
