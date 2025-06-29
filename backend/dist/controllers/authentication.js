"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateUser = exports.login = exports.register = void 0;
const users_1 = require("../db/users");
const helpers_1 = require("../helpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = require("lodash");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';
// ------------------- Register -------------------
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'All fields are required.' });
            return;
        }
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            res.status(409).json({ message: 'User already exists.' });
            return;
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        const user = await (0, users_1.createUser)({
            username,
            email,
            authentication: {
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ message: 'Something went wrong' });
    }
};
exports.register = register;
// ------------------- Login -------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }
        const user = await (0, users_1.getUserByEmail)(email).select('+authentication.password');
        if (!user || !user.authentication?.password) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }
        const isValid = await (0, helpers_1.verifyPassword)(password, user.authentication.password);
        if (!isValid) {
            res.status(403).json({ message: 'Invalid credentials.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('AUTH-TOKEN', token, {
            httpOnly: true,
            domain: 'localhost',
            path: '/',
        });
        res.status(200).json({ message: 'Login successful', user });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Something went wrong' });
    }
};
exports.login = login;
// ------------------- Update User -------------------
const updateUser = async (req, res) => {
    try {
        const user = (0, lodash_1.get)(req, 'identity');
        if (!user || !user._id) {
            res.status(401).json({ message: 'Unauthorized or invalid user.' });
            return;
        }
        const { username, email } = req.body;
        if (!username && !email) {
            res.status(400).json({ message: 'No updates provided' });
            return;
        }
        const updates = {};
        if (username)
            updates.username = username;
        if (email)
            updates.email = email;
        const updatedUser = await (0, users_1.updateUserById)(user.id, updates);
        res.status(200).json({ message: 'User updated', user: updatedUser });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({ message: 'Something went wrong' });
    }
};
exports.updateUser = updateUser;
// ------------------- Logout -------------------
const logout = async (req, res) => {
    try {
        const user = req.identity;
        if (!user || !user._id) {
            res.status(401).json({ message: 'Unauthorized or invalid user.' });
            return;
        }
        res.clearCookie('AUTH-TOKEN', {
            domain: 'localhost',
            path: '/',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(400).json({ message: 'Something went wrong' });
    }
};
exports.logout = logout;
//# sourceMappingURL=authentication.js.map