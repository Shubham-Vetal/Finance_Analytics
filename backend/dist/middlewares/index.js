"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../db/users");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies['AUTH-TOKEN'];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await (0, users_1.getUserById)(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.identity = user;
        next();
    }
    catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=index.js.map