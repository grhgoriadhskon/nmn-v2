import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/index.js';
import { initDb } from './db/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes         from './modules/auth/auth.routes.js';
import usersRoutes        from './modules/users/users.routes.js';
import prosRoutes         from './modules/pros/pros.routes.js';
import servicesRoutes     from './modules/services/services.routes.js';
import bookingsRoutes     from './modules/bookings/bookings.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import devRoutes           from './modules/dev/dev.routes.js';

initDb();

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/pros',          prosRoutes);
app.use('/api/services',      servicesRoutes);
app.use('/api/bookings',      bookingsRoutes);
app.use('/api/availability',  availabilityRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dev',          devRoutes);

app.use(errorHandler);

app.listen(config.port, config.host, () => {
  console.log(`NMN API running at http://${config.host}:${config.port}`);
});

export default app;
