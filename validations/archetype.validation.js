const { z } = require("zod");

const createArchetypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().optional(),
  color: z.string().trim().max(20).optional(),
});

const updateArchetypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  description: z.string().trim().optional(),
  color: z.string().trim().max(20).optional(),
});

const archetypeParamsSchema = z.object({
  id: z.coerce.number().int().positive("Archetype id must be a positive number"),
});

module.exports = { createArchetypeSchema, updateArchetypeSchema, archetypeParamsSchema };
