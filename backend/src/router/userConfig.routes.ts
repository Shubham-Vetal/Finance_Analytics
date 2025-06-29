import express from 'express';
import { saveUserConfig, getUserConfig } from '../controllers/userConfigController';
import { isAuthenticated } from '../middlewares/index';

const router = express.Router();

router.post('/auth/user-config/save', isAuthenticated, saveUserConfig);
router.get('/auth/user-config/get', isAuthenticated, getUserConfig);

export default router;
