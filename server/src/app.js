import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import auditRoutes from './routes/audit.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

app.use(cors());

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit', auditRoutes);

app.use(notFoundHandler);  // ← adăugat
app.use(errorHandler);     // ← adăugat, întotdeauna ultimul

export default app;