import { Router } from 'express';
import { AuthController, TaskController, DashboardController } from './controllers.js';
import { requireAuth, attachUser } from './middleware.js';
import { IAuthenticatedRequest } from './types.js';

const router = Router();

// Public routes
router.get('/', attachUser, (req: IAuthenticatedRequest, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('pages/home', { title: 'TaskFlow', user: null });
});

router.get('/auth/login', AuthController.loginPage);
router.post('/auth/login', AuthController.login);
router.get('/auth/register', AuthController.registerPage);
router.post('/auth/register', AuthController.register);
router.post('/auth/logout', AuthController.logout);

// Protected routes
router.use(attachUser);
router.use(requireAuth);

router.get('/dashboard', DashboardController.index);

router.get('/tasks', TaskController.list);
router.get('/tasks/new', TaskController.createPage);
router.post('/tasks', TaskController.create);
router.get('/tasks/:id', TaskController.detail);
router.get('/tasks/:id/edit', TaskController.updatePage);
router.post('/tasks/:id', TaskController.update); // Using POST for form submission
router.post('/tasks/:id/delete', TaskController.delete); // Using POST for form submission

export default router;
