import { z } from "zod";

export const syllabusSchema = z.object({
  subjects: z.array(
    z.object({
      name: z.string(),
      topics: z.array(z.string()),
    })
  ),
});

// ✅ Infer TypeScript type from Zod schema
export type Syllabus = z.infer<typeof syllabusSchema>;
