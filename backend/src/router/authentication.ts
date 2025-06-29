// routes/authentication.ts
import { Router } from 'express';
import { register, login, updateUser, logout, getCurrentUser,changePassword} from '../controllers/authentication';
import { isAuthenticated } from '../middlewares/index';



export const authenticationRoutes = (router: Router) => {
  router.post('/auth/register', register);
  router.post('/auth/login', login);
  router.put('/auth/update', isAuthenticated, updateUser);
  router.post('/auth/logout', isAuthenticated, logout);
  router.put('/auth/change-password', isAuthenticated, changePassword);
  router.get('/auth/me', getCurrentUser);
 
};
