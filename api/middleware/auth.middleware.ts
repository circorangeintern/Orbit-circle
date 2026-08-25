import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload, type VerifyErrors } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    jwt.verify(token, process.env.JWT_SECRET ?? '', (err: VerifyErrors | null, authData: string | JwtPayload | undefined) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Access denied. Token expired.' });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ message: 'Access denied. Invalid token.' });
        }

        return res.status(403).json({ message: 'Access denied. Token verification failed.' });
      }

      if (!authData) {
        return res.status(403).json({ message: 'Access denied. Token verification failed.' });
      }

      req.user = authData;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default authMiddleware;
