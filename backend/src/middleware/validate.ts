// src/middleware/validate.ts
import { RequestHandler } from "express";
import { z, ZodError } from "zod";

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  source: "body" | "query" | "params" | "headers" = "body"
): RequestHandler<any, any, any, any, { validated: z.infer<T> }> {
  return (req, res, next) => {
    try {
      const raw = (req as any)[source];
      const parsed = schema.parse(raw);

      // Attach validated payload for downstream handlers
      res.locals.validated = parsed as z.infer<T>;
      return next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        // Use the new tree format (recommended replacement for `flatten()`).
        // The structure is nested and more suitable for complex objects.
        const errorTree = z.treeifyError(err);
        return res.status(400).json({ errors: errorTree });
      }

      // Pass non-Zod errors to the default error handler
      return next(err);
    }
  };
}
