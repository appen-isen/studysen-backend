import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

const Validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: errors.array({ onlyFirstError: true })[0].msg });
    return;
  }
  next();
};
export default Validate;
