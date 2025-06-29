import { Router } from 'express';
import { authenticationRoutes } from './authentication';

const router = Router();
authenticationRoutes(router);

export default router;
