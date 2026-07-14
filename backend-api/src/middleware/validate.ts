import { Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { AuthRequest } from './auth';

/** Validates and coerces req.body against a Zod schema; 400 with messages on failure. */
export function validate(schema: ZodTypeAny) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join('; ');
      res.status(400).json({ error: message });
      return;
    }
    req.body = result.data;
    next();
  };
}
