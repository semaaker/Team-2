import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Async route handler'larındaki reddedilen promise'leri Express hata
 * middleware'ine iletir. Express 4, async fonksiyonların hatalarını
 * kendiliğinden yakalamaz.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
