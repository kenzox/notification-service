import { z } from 'zod';

export const emailRequestSchema = z.object({
    to: z.array(z.string().email()).min(1, 'At least one recipient is required'),
    locale: z.string().default('tr'),
    subject: z.string().optional(),
    data: z.record(z.unknown()).default({}),
    meta: z
        .object({
            reply_to: z.string().email().optional(),
            cc: z.array(z.string().email()).optional(),
            bcc: z.array(z.string().email()).optional(),
            attachments: z
                .array(
                    z.object({
                        filename: z.string(),
                        path: z.string().optional(),
                        content: z.string().optional(),
                    })
                )
                .optional(),
        })
        .optional(),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
