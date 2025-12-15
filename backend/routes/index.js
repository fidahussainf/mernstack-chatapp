import express from 'express';
import authRoute from './authRoutes.js';
import userRoute from './userRoutes.js';
import chatRoute from './chatRoutes.js';
import messageRoute from './messageRoutes.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/chat',
    route: chatRoute,
  },
  {
    path: '/messages',
    route: messageRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;