import { z } from 'zod';

export const taskschema = z.object({
    description: z.string().min(1),
    image: z.string().optional(),
    voiceMessage: z.string().optional(),
    startDate: z.string().optional(),  // ISO string
    endDate: z.string().optional()     // ISO string
});

export type TagsInput = z.infer<typeof taskschema>;
