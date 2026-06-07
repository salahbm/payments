import { z } from 'zod';

export const environmentSchema = z.enum(['sandbox', 'production']);

export const ENVIRONMENTS = environmentSchema.options;
