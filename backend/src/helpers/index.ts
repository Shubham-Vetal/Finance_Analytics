import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// -------------------- BCRYPT --------------------

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// -------------------- JWT --------------------

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // Use .env in real apps

// Payload can be extended with more fields like role, username, etc.
export const generateJWT = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Token valid for 7 days
};

export const verifyJWT = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
