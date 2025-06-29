import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../db/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies['AUTH-TOKEN'];

    if (!token) {
      res.status(403).json({ message: 'No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await getUserById(decoded.id).select('+authenticationPassword');
    if (!user) {
      res.status(403).json({ message: 'Invalid or expired token.' });
      return;
    }

    // Attach user to request
    req.identity = user;

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
