import { Request, Response } from 'express';
import { createUser, getUserByEmail, updateUserById, getUserById } from '../db/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { get } from 'lodash';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Ensure this is a strong secret from your .env
const JWT_EXPIRES_IN = '1d'; // JWT expiration time

// --- NEW: Determine if we are in production environment ---
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// --- NEW: Dynamically set the cookie domain ---
// For Render deployment, the domain should be '.onrender.com' (note the leading dot)
// This allows the cookie to be sent to subdomains like 'finance-analytics-backend.onrender.com'
// and 'your-frontend-app.onrender.com'.
// For local development, it remains 'localhost'.
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

    // Ensure that getUserByEmail fetches the password hash for comparison
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
res.cookie('AUTH-TOKEN', token, {
  httpOnly: true,
  path: '/',
  ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }), // ⬅️ only sets if defined
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24,
});


    // Remove password hash before sending user object to frontend for security
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.authenticationPassword;

    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
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
    res.clearCookie('AUTH-TOKEN', {
      httpOnly: true,
      path: '/',
      domain: COOKIE_DOMAIN, // ✨ FIXED: Dynamic domain for cross-origin use
      secure: IS_PRODUCTION, // ✨ FIXED: Only send over HTTPS in production
      sameSite: IS_PRODUCTION ? 'none' : 'lax', // ✨ FIXED: 'none' for cross-site
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: If you add `isAuthenticated` middleware to `/auth/me` as recommended,
    // you might be able to get user directly from `req.identity` here,
    // making the token verification redundant in this controller.
    // For now, keeping the direct token check as per your original code.
    const token = req.cookies['AUTH-TOKEN'];
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

    // Remove password hash before sending user object to frontend
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