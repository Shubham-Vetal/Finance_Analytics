import { Request, Response } from 'express';
import { createUser, getUserByEmail, updateUserById, getUserById } from '../db/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { get } from 'lodash';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Ensure this is a strong secret from your .env
const JWT_EXPIRES_IN = '1d'; // JWT expiration time


const IS_PRODUCTION = process.env.NODE_ENV === 'production';


const COOKIE_DOMAIN = IS_PRODUCTION ? '.onrender.com' : 'localhost';

// ------------------- Register -------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: 'User already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      username,
      email,
      authenticationPassword: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------- Login -------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await getUserByEmail(email).select('+authenticationPassword');
    if (!user || !user.authenticationPassword) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.authenticationPassword);
    if (!isMatch) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.authenticationPassword;

    // ✅ Send token in body, not in cookies
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = get(req, 'identity'); // this should be injected by auth middleware

    if (!user || !user._id) {
      res.status(401).json({ message: 'Unauthorized or invalid user.' });
      return;
    }

    const { username, email } = req.body;

    if (!username && !email) {
      res.status(400).json({ message: 'No update fields provided.' });
      return;
    }

    const updates: Record<string, any> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    // Assuming user.id is already a string or can be converted.
    // If updateUserById expects Mongoose ObjectId, convert user._id
    const updatedUser = await updateUserById(user._id.toString(), updates);

    // Remove password hash before sending user object to frontend
    const userWithoutPassword = updatedUser.toObject();
    delete userWithoutPassword.authenticationPassword;

    res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
   
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await getUserById(decoded.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.authenticationPassword;

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// ------------------- Change Password -------------------

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.identity; // This should be set by isAuthenticated middleware
    const { currentPassword, newPassword } = req.body;

    if (!user || !user._id || !currentPassword || !newPassword) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    // Ensure user.authenticationPassword is fetched by the isAuthenticated middleware for comparison
    const isMatch = await bcrypt.compare(currentPassword, user.authenticationPassword);
    if (!isMatch) {
      res.status(403).json({ message: 'Current password is incorrect.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserById(user._id.toString(), {
      authenticationPassword: hashedPassword,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};