import { z } from 'zod';

export const PermissionSchema = z.object({
    userId: z.number(),
    permission: z.string()
});

export type TagsInput = z.infer<typeof PermissionSchema>;